import { PrismaClient, Prisma } from '@prisma/client';
import express, { Request, Response, response } from 'express';

const prisma = new PrismaClient();

//#region get student
async function StudentOutcome(req: Request, res: Response) {
  const { RegNO } = req.body;

  if (!RegNO) {
    return res.status(400).json({
      msg: "Required  Register No.",

    });
  }

  try {

    const student = await prisma.student.findMany({
      where: {
        regNo: {
          equals: RegNO
        }
      },
      include: {
        code: true,
        marks: true
      }
    })

    if (!student) {
      return res.status(500).json({
        msg: "No Student Record found",
      })
    }

    return res.status(200).json({
      student
    });

  } catch (error) {
    res.status(500).json({ msg: 'Internal server error.' });
  }
}
//#endregion

//#region course reusable
async function Course(code: string) {

  try {

    const students = await prisma.student.findMany({
      where: {
        code: {
          code: code,
        },
      },
      include: {
        marks: true,
      },
    });


    const updatedStudents = students.map((student) => {

      const TCO1 = student.marks.reduce((total, mark) => {
        const C1CO1 = mark.C1LOT || 0;
        const C2CO1 = mark.C2LOT || 0;
        const ASGCO1 = mark.ASGCO1 || 0;
        const ASGCO2 = mark.ASGCO2 || 0;
        return total + C1CO1 + C2CO1 + ASGCO1 + ASGCO2;
      }, 0);

      const TCO2 = student.marks.reduce((total, mark) => {
        const C1CO2 = mark.C1MOT || 0;
        const C2CO2 = mark.C2MOT || 0;
        return total + C1CO2 + C2CO2;
      }, 0);

      const TCO3 = student.marks.reduce((total, mark) => {
        const C1CO3 = mark.C1HOT || 0;
        const C2CO3 = mark.C2HOT || 0;
        return total + C1CO3 + C2CO3;
      }, 0);

      return {
        id: student.id,
        TCO1: TCO1,
        TCO2: TCO2,
        TCO3: TCO3,
      };
    });

    const updateresult = await Promise.all(
      updatedStudents.map(async (updatedStudent) => {
        await prisma.marks.updateMany({
          where: {
            studentId: updatedStudent.id,
          },
          data: {
            TLOT: updatedStudent.TCO1,
            TMOT: updatedStudent.TCO2,
            THOT: updatedStudent.TCO3,
          },
        });
      })
    );

    const updatedMarks = updatedStudents.map((updatedStudent) => {
      return {
        id: updatedStudent.id,
        TCO1: updatedStudent.TCO1,
        TCO2: updatedStudent.TCO2,
        TCO3: updatedStudent.TCO3,
      };
    });

    const totalStudents = updatedMarks.length;

    const above40TCO1 = updatedMarks.filter((student) => student.TCO1 >= 40.8);
    const above40TCO2 = updatedMarks.filter((student) => student.TCO2 >= 43.2);
    const above40TCO3 = updatedMarks.filter((student) => student.TCO3 >= 12);

    const countAbove40TCO1 = above40TCO1.length;
    const countAbove40TCO2 = above40TCO2.length;
    const countAbove40TCO3 = above40TCO3.length;


    const percentageTCO1 = (countAbove40TCO1 / totalStudents) * 100;
    const percentageTCO2 = (countAbove40TCO2 / totalStudents) * 100;
    const percentageTCO3 = (countAbove40TCO3 / totalStudents) * 100;

    const above40TCO = {
      TCO1: above40TCO1.length,
      TCO2: above40TCO2.length,
      TCO3: above40TCO3.length,
    };

    const calculateAttainLevel = (percentage: number) => {
      return percentage >= 75 ? 3 : percentage >= 60 ? 2 : percentage >= 40 ? 1 : 0;
    };

    const percentages = {
      TCO1: totalStudents > 0 ? ((countAbove40TCO1 / totalStudents) * 100).toFixed(2) : 0,
      TCO2: totalStudents > 0 ? ((countAbove40TCO2 / totalStudents) * 100).toFixed(2) : 0,
      TCO3: totalStudents > 0 ? ((countAbove40TCO3 / totalStudents) * 100).toFixed(2) : 0,
    };

    const attainLevelTCO1 = calculateAttainLevel(percentageTCO1);
    const attainLevelTCO2 = calculateAttainLevel(percentageTCO2);
    const attainLevelTCO3 = calculateAttainLevel(percentageTCO3);

    const attainLevels = {
      TCO1: attainLevelTCO1,
      TCO2: attainLevelTCO2,
      TCO3: attainLevelTCO3,
    };


    const countAbove12ESECO1 = students.filter((student) =>
      student.marks.some((mark) => mark.ESELOT !== null && mark.ESELOT >= 17.4)
    ).length;
    const countAbove16ESECO2 = students.filter((student) =>
      student.marks.some((mark) => mark.ESEMOT !== null && mark.ESEMOT >= 21.6)
    ).length;
    const countAbove14ESECO3 = students.filter((student) =>
      student.marks.some((mark) => mark.ESEHOT !== null && mark.ESEHOT >= 6)
    ).length;


    // Create an object to hold all above-40 ESECO values
    const above40ESECO = {
      ESECO1: countAbove12ESECO1,
      ESECO2: countAbove16ESECO2,
      ESECO3: countAbove14ESECO3,
    };

    const percentagesESECO = {
      ESECO1: 0,
      ESECO2: 0,
      ESECO3: 0,
    };

    // Calculate the percentage for each ESECO if there are students meeting the condition
    if (totalStudents > 0) {
      percentagesESECO.ESECO1 = parseFloat(((countAbove12ESECO1 / totalStudents) * 100).toFixed(2));
      percentagesESECO.ESECO2 = parseFloat(((countAbove16ESECO2 / totalStudents) * 100).toFixed(2));
      percentagesESECO.ESECO3 = parseFloat(((countAbove14ESECO3 / totalStudents) * 100).toFixed(2));
    }

    // Calculate ATTAINLEVEL for each ESECO
    const attainLevelESECO1 = calculateAttainLevel(percentagesESECO.ESECO1);
    const attainLevelESECO2 = calculateAttainLevel(percentagesESECO.ESECO2);
    const attainLevelESECO3 = calculateAttainLevel(percentagesESECO.ESECO3);

    // Create an object to hold ATTAINLEVEL for each ESECO
    const attainLevelsESECO = {
      ESECO1: attainLevelESECO1,
      ESECO2: attainLevelESECO2,
      ESECO3: attainLevelESECO3,
    };

    let overAll = {
      CO1: (attainLevels.TCO1 + attainLevelsESECO.ESECO1) / 2,
      CO2: (attainLevels.TCO2 + attainLevelsESECO.ESECO2) / 2,
      CO3: (attainLevels.TCO3 + attainLevelsESECO.ESECO3) / 2,
    };

    let averageAttainLevel = ((overAll.CO1 + overAll.CO2 + overAll.CO3) / 3).toFixed(2);

    let direct80 = (80 * parseFloat(averageAttainLevel)) / 100;


    //pso

    const existingCode = await prisma.code.findFirst({
      where: {
        code: code,
      },
    });

    let psoCOS = {
      ps1: 0,
      ps2: 0,
      ps3: 0,
      ps4: 0,
      ps5: 0
    }

    if (existingCode) {
      const getPso = await prisma.pSO.findFirst({
        where: {
          codeId: existingCode.id
        }
      })
      if (getPso) {
        psoCOS.ps1 = (getPso.PSO1CO1 * overAll.CO1) + (getPso.PSO1CO2 * overAll.CO1) + (getPso.PSO1CO3 * overAll.CO2) + (getPso.PSO1CO4 * overAll.CO2) + (getPso.PSO1CO5 * overAll.CO3) / getPso.PSO1CO1 + getPso.PSO1CO2 + getPso.PSO1CO3 + getPso.PSO1CO4 + getPso.PSO1CO5
        psoCOS.ps2 = (getPso.PSO2CO1 * overAll.CO1) + (getPso.PSO2CO2 * overAll.CO1) + (getPso.PSO2CO3 * overAll.CO2) + (getPso.PSO2CO4 * overAll.CO2) + (getPso.PSO2CO5 * overAll.CO3) / getPso.PSO2CO1 + getPso.PSO2CO2 + getPso.PSO2CO3 + getPso.PSO2CO4 + getPso.PSO2CO5
        psoCOS.ps3 = (getPso.PSO3CO1 * overAll.CO1) + (getPso.PSO3CO2 * overAll.CO1) + (getPso.PSO3CO3 * overAll.CO2) + (getPso.PSO3CO4 * overAll.CO2) + (getPso.PSO3CO5 * overAll.CO3) / getPso.PSO3CO1 + getPso.PSO3CO2 + getPso.PSO3CO3 + getPso.PSO3CO4 + getPso.PSO3CO5
        psoCOS.ps4 = (getPso.PSO4CO1 * overAll.CO1) + (getPso.PSO4CO2 * overAll.CO1) + (getPso.PSO4CO3 * overAll.CO2) + (getPso.PSO4CO4 * overAll.CO2) + (getPso.PSO4CO5 * overAll.CO3) / getPso.PSO4CO1 + getPso.PSO4CO2 + getPso.PSO4CO3 + getPso.PSO4CO4 + getPso.PSO4CO5
        psoCOS.ps5 = (getPso.PSO5CO1 * overAll.CO1) + (getPso.PSO5CO2 * overAll.CO1) + (getPso.PSO5CO3 * overAll.CO2) + (getPso.PSO5CO4 * overAll.CO2) + (getPso.PSO5CO5 * overAll.CO3) / getPso.PSO5CO1 + getPso.PSO5CO2 + getPso.PSO5CO3 + getPso.PSO5CO4 + getPso.PSO5CO5
      }
    }




    // Send the attainLevels, above40TCO, and above40ESECO as part of your JSON response
    return {
      totalStudents,
      above40TCO,
      percentages,
      attainLevels,
      above40ESECO,
      percentagesESECO,
      attainLevelsESECO,
      overAll,
      averageAttainLevel,
      direct80,
      psoCOS
    };
  } catch (error) {
    console.error(error);
  }
}
//#endregion

//#region get Course
async function CourseOutCome(req: Request, res: Response) {
  const { code, department } = req.body;

  if (!code || !department) {
    return res.status(400).json({
      msg: "Missing required fields code or department.",

    });
  }

  try {
    // Check if the department is associated with the provided code
    const departmentWithCode = await prisma.department.findFirst({
      where: {
        departmentCode: department,
        codes: {
          some: {
            code: code,
          },
        },
      },
    });

    if (!departmentWithCode) {
      return res.status(400).json({ msg: 'Department not found for the given code.' });
    }

    const DataOfCourse = await Course(code)

    return res.status(200).json({
      message: 'Marks updated successfully.',
      totalStudents: DataOfCourse?.totalStudents,
      above40TCO: DataOfCourse?.above40TCO,
      percentages: DataOfCourse?.percentages,
      attainLevels: DataOfCourse?.attainLevels,
      above40ESECO: DataOfCourse?.above40ESECO,
      percentagesESECO: DataOfCourse?.percentagesESECO,
      attainLevelsESECO: DataOfCourse?.attainLevelsESECO,
      overAll: DataOfCourse?.overAll,
      averageAttainLevel: DataOfCourse?.averageAttainLevel,
      direct80: DataOfCourse?.direct80,
      psoCOS: DataOfCourse?.psoCOS
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error.' });
  }
}
//#endregion

//#region get by department
async function DepartmentOutcome(req: Request, res: Response) {
  const { department } = req.body;

  if (!department) {
    return res.status(400).json({
      msg: "Missing required field department.",

    });
  }

  try {
    // Check if the department exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        departmentCode: department,
      },
    });

    if (!existingDepartment) {
      return res.status(400).json({ msg: 'Department not found.' });
    }

    // Retrieve all course codes under the given department
    const courseCodes = await prisma.code.findMany({
      where: {
        depCode: department,
      },
    });

    interface AttainData {
      courseTitle: string,
      courseCode: string,
      ciaAttain: string;
      eseAtain: string;
      overAtain: string;
    }

    let returnData: AttainData[] = [];

    // Calculate outcome for each course code
    const outcomeResults = await Promise.all(courseCodes.map(async (courseCode) => {
      const DataOfCourse = await Course(courseCode.code)

      const averageAttainLevelCIA = (DataOfCourse?.attainLevels?.TCO1 || 0) + (DataOfCourse?.attainLevels?.TCO2 || 0) + (DataOfCourse?.attainLevels?.TCO3 || 0) / 3
      const averageAttainLevelESE = (DataOfCourse?.attainLevelsESECO?.ESECO1 || 0) + (DataOfCourse?.attainLevelsESECO?.ESECO2 || 0) + (DataOfCourse?.attainLevelsESECO?.ESECO3 || 0) / 3

      returnData.push({
        courseCode: courseCode.code,
        courseTitle: courseCode.name,
        ciaAttain: averageAttainLevelCIA.toFixed(2).toString(),
        eseAtain: averageAttainLevelESE.toFixed(2).toString(),
        overAtain: (DataOfCourse?.averageAttainLevel || 0).toString(),
      });
    }))

    return res.status(200).json({
      returnData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error.' });
  }
}
//#endregion

//#region get by category
async function ProgramOutcome(req: Request, res: Response) {
  const { catagory } = req.body;

  const getDepByCatagory = await prisma.department.findMany({
    where: {
      catagory: catagory
    }
  })

  interface AttainDataForEachDep {
    depTitle: string,
    depCode: string,
    overAtain: string;
  }

  let returnDepData: AttainDataForEachDep[] = [];

  try {
    await Promise.all(getDepByCatagory.map(async (eachDep) => {

      // Retrieve all course codes under the given department
      const courseCodes = await prisma.code.findMany({
        where: {
          depCode: eachDep.departmentCode,
        },
      });

      interface AttainData {
        overAtain: string;
      }

      let returnData: AttainData[] = [];

      // Calculate outcome for each course code
      const outcomeResults = await Promise.all(courseCodes.map(async (courseCode) => {

        const DataOfCourse = await Course(courseCode.code)

        returnData.push({
          overAtain: DataOfCourse?.averageAttainLevel.toString() || '-',
        });

      }))

      let i = 0;

      returnData.map((item) => {
        i += parseFloat(item.overAtain);
      });

      i = parseFloat(i.toFixed(2));

      returnDepData.push({
        depTitle: eachDep.name.toString(),
        depCode: eachDep.departmentCode.toString(),
        overAtain: (i / returnData.length).toString()
      })

    }))

    return res.status(200).json({
      returnDepData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error.' });
  }

}
//#endregion

export { StudentOutcome, CourseOutCome, DepartmentOutcome, ProgramOutcome }