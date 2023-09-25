import express, { Request, Response, response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { fromZodError } from "zod-validation-error"
import { ESEData, ESESchema, assignmentData, assignmentSchema, cia1Data, cia1Schema, cia2Data, cia2Schema, psoData, psoSchema } from '../model/result';
import { ZodError, object } from 'zod';

const prisma = new PrismaClient();


export const userRouter = express.Router();

userRouter.post("/addMarks", addMark);
userRouter.put("/getMarks", getMarks);
userRouter.post("/addPso", addPso);

userRouter.get("/getMarkByCode", getMarkByCode);
// userRouter.get("/searchCode", getCode); 


//Add Marks
async function addMark(req: Request, res: Response) {
  const { regNo, exam, code, department, claass, section } = req.body;

  // Check for missing required fields
  if (!regNo || !exam || !code || !department || !claass || !section) {
    return res.status(400).json({
      error: {
        message: "Missing required fields regNo or exam or code or department or claass or section",
      },
    });
  }

  try {
    
    const check = await prisma.code.findFirst({
      where: {
        depCode: department,
        code: code,
      },
    });

    if (!check) {
      return res.status(404).json({
        error: {
          message: "Department code not found",
        },
      });
    }

    // Check if the student exists
    let student = await prisma.student.findFirst({
      where: {
        codeId: check.id,
        regNo: regNo,
      },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          regNo: regNo,
          claass: claass,
          section: section,
          codeId: check.id,
        },
      });

      if (!student) {
        return res.json({
          error: {
            message: "Error occurred while creating the student",
          },
        });
      }
    }

    // Now, create the marks
    if (exam == "CIA-1") {
      const data1 = cia1Schema.safeParse(req.body);
    
      if (!data1.success) {
        let errMessage: string = fromZodError(data1.error).message;
        return res.status(400).json({
          error: {
            message: errMessage,
          },
        });
      }
    
      const resultData: cia1Data = data1.data;
    
      if (!resultData) {
        return res.status(409).json({
          error: {
            message: "Invalid params",
          },
        });
      }
    
      let marks = await prisma.marks.findFirst({
        where: {
          studentId: student ? student.id : 0,
        },
      });
    
      if (marks) {
        // Marks already exist, update them
        const updatedMark = await prisma.marks.update({
          where: { id: marks.id }, // Assuming there's an ID for the existing mark
          data: {
            C1Q1: resultData.C1Q1,
             C1Q2: resultData.C1Q2,
             C1Q3: resultData.C1Q3,
             C1Q4: resultData.C1Q4,
             C1Q5: resultData.C1Q5,
             C1Q6: resultData.C1Q6,
             C1Q7: resultData.C1Q7,
             C1Q8: resultData.C1Q8,
             C1Q9: resultData.C1Q9,
             C1Q10: resultData.C1Q10,
             C1Q11: resultData.C1Q11,
             C1Q12: resultData.C1Q12,
             C1Q13: resultData.C1Q13,
             C1Q14: resultData.C1Q14,
             C1Q15: resultData.C1Q15,
             C1Q16: resultData.C1Q16,
             C1Q17: resultData.C1Q17,
             C1Q18: resultData.C1Q18,
             C1Q19: resultData.C1Q19,
             C1Q20: resultData.C1Q20,
             C1Q21: resultData.C1Q21,
             C1Q22: resultData.C1Q22,
             C1Q23: resultData.C1Q23,
             C1Q24: resultData.C1Q24,
             C1Q25: resultData.C1Q25,
             C1Q26: resultData.C1Q26,
             C1Q27: resultData.C1Q27,
             C1Q28: resultData.C1Q28,
             C1STATUS: resultData.C1STATUS,
             C1STAFF:  resultData.C1STAFF,
             studentId: student ? student.id : 0,
  
             C1CO1: resultData.C1Q1 + resultData.C1Q2 + resultData.C1Q5 + resultData.C1Q6 + resultData.C1Q9 + resultData.C1Q10 + resultData.C1Q13 + resultData.C1Q14 + resultData.C1Q17 + resultData.C1Q18,
             C1CO2: resultData.C1Q3 + resultData.C1Q4 + resultData.C1Q7 + resultData.C1Q8 + resultData.C1Q11 + resultData.C1Q12 + resultData.C1Q15 + resultData.C1Q16 + resultData.C1Q19 + resultData.C1Q20 + resultData.C1Q21,
             C1CO3: resultData.C1Q22 + resultData.C1Q23 + resultData.C1Q26,
             C1CO4: resultData.C1Q24 + resultData.C1Q25 + resultData.C1Q27,
             C1CO5: resultData.C1Q28,
          },
        });
    
        return res.json({
          success: "CIA-1 marks are updated successfully",
        });
      }
    
      // If marks do not exist, create them
      const mark = await prisma.marks.create({
        data: {
          C1Q1: resultData.C1Q1,
          C1Q2: resultData.C1Q2,
          C1Q3: resultData.C1Q3,
          C1Q4: resultData.C1Q4,
          C1Q5: resultData.C1Q5,
          C1Q6: resultData.C1Q6,
          C1Q7: resultData.C1Q7,
          C1Q8: resultData.C1Q8,
          C1Q9: resultData.C1Q9,
          C1Q10: resultData.C1Q10,
          C1Q11: resultData.C1Q11,
          C1Q12: resultData.C1Q12,
          C1Q13: resultData.C1Q13,
          C1Q14: resultData.C1Q14,
          C1Q15: resultData.C1Q15,
          C1Q16: resultData.C1Q16,
          C1Q17: resultData.C1Q17,
          C1Q18: resultData.C1Q18,
          C1Q19: resultData.C1Q19,
          C1Q20: resultData.C1Q20,
          C1Q21: resultData.C1Q21,
          C1Q22: resultData.C1Q22,
          C1Q23: resultData.C1Q23,
          C1Q24: resultData.C1Q24,
          C1Q25: resultData.C1Q25,
          C1Q26: resultData.C1Q26,
          C1Q27: resultData.C1Q27,
          C1Q28: resultData.C1Q28,
          C1STATUS: resultData.C1STATUS,
          C1STAFF:  resultData.C1STAFF,
          studentId: student ? student.id : 0,

          C1CO1: resultData.C1Q1 + resultData.C1Q2 + resultData.C1Q5 + resultData.C1Q6 + resultData.C1Q9 + resultData.C1Q10 + resultData.C1Q13 + resultData.C1Q14 + resultData.C1Q17 + resultData.C1Q18,
          C1CO2: resultData.C1Q3 + resultData.C1Q4 + resultData.C1Q7 + resultData.C1Q8 + resultData.C1Q11 + resultData.C1Q12 + resultData.C1Q15 + resultData.C1Q16 + resultData.C1Q19 + resultData.C1Q20 + resultData.C1Q21,
          C1CO3: resultData.C1Q22 + resultData.C1Q23 + resultData.C1Q26,
          C1CO4: resultData.C1Q24 + resultData.C1Q25 + resultData.C1Q27,
          C1CO5: resultData.C1Q28,
        },
      });
    
      return res.json({
        success: "CIA-1 marks are added successfully",
      });
    }
     
    
    else if (exam === "CIA-2") {
      const data2 = cia2Schema.safeParse(req.body);
    
      if (!data2.success) {
        let errMessage: string = fromZodError(data2.error).message;
        return res.status(400).json({
          error: {
            message: errMessage,
          },
        });
      }
    
      const resultData: cia2Data = data2.data;
    
      if (!resultData) {
        return res.status(409).json({
          error: {
            message: "Invalid params",
          },
        });
      }
    
      // Check if CIA-1 marks exist for this student
      let existingCIA1Marks = await prisma.marks.findFirst({
        where: {
          studentId: student ? student.id : 0,
        },
      });
    
      if (!existingCIA1Marks || existingCIA1Marks.C1Q1 === null) {
        return res.status(409).json({
          error: {
            message: "CIA-1 marks do not exist for this student",
          },
        });
      }
    
      // Now, you can proceed with updating CIA-2 marks
      let existingCIA2Marks = await prisma.marks.findFirst({
        where: {
          studentId: student ? student.id : 0,
        },
      });
    
      if (!existingCIA2Marks) {
        return res.status(409).json({
          error: {
            message: "CIA-2 marks do not exist for this student",
          },
        });
      }
    
      // Update the existing CIA-2 marks with the new data.
      const updatedCIA2Marks = await prisma.marks.update({
        where: {
          id: existingCIA2Marks.id,
        },
        data: {
          C2Q1: resultData.C2Q1,
          C2Q2: resultData.C2Q2,
          C2Q3: resultData.C2Q3,
          C2Q4: resultData.C2Q4,
          C2Q5: resultData.C2Q5,
          C2Q6: resultData.C2Q6,
          C2Q7: resultData.C2Q7,
          C2Q8: resultData.C2Q8,
          C2Q9: resultData.C2Q9,
          C2Q10: resultData.C2Q10,
          C2Q11: resultData.C2Q11,
          C2Q12: resultData.C2Q12,
          C2Q13: resultData.C2Q13,
          C2Q14: resultData.C2Q14,
          C2Q15: resultData.C2Q15,
          C2Q16: resultData.C2Q16,
          C2Q17: resultData.C2Q17,
          C2Q18: resultData.C2Q18,
          C2Q19: resultData.C2Q19,
          C2Q20: resultData.C2Q20,
          C2Q21: resultData.C2Q21,
          C2Q22: resultData.C2Q22,
          C2Q23: resultData.C2Q23,
          C2Q24: resultData.C2Q24,
          C2Q25: resultData.C2Q25,
          C2Q26: resultData.C2Q26,
          C2Q27: resultData.C2Q27,
          C2Q28: resultData.C2Q28,

          C2CO1: resultData.C2Q1 + resultData.C2Q2 + resultData.C2Q5 + resultData.C2Q6 + resultData.C2Q9 + resultData.C2Q10 + resultData.C2Q13 + resultData.C2Q14 + resultData.C2Q17 + resultData.C2Q18,
          C2CO2: resultData.C2Q3 + resultData.C2Q4 + resultData.C2Q7 + resultData.C2Q8 + resultData.C2Q11 + resultData.C2Q12 + resultData.C2Q15 + resultData.C2Q16 + resultData.C2Q19 + resultData.C2Q20 + resultData.C2Q21,
          C2CO3: resultData.C2Q22 + resultData.C2Q23 + resultData.C2Q26,
          C2CO4: resultData.C2Q24 + resultData.C2Q25 + resultData.C2Q27,
          C2CO5: resultData.C2Q28,

          C2STATUS: resultData.C2STATUS,
          C2STAFF: resultData.C2STAFF,    //cia -2 staff initiall

        },
      });
    
      return res.json({
        success: "CIA-2 is added successfully"
      });
    }
    
    
    else if (exam === "ASG") {
      const data3 = assignmentSchema.safeParse(req.body);
    
      if (!data3.success) {
        let errMessage: string = fromZodError(data3.error).message;
        return res.status(400).json({
          error: {
            message: errMessage,
          },
        });
      }
    
      const resultData: assignmentData = data3.data;
    
      // Check if CIA-1 marks exist for this student
      let existingCIA1Marks = await prisma.marks.findFirst({
        where: {
          studentId: student ? student.id : 0,
        },
      });
    
      if (!existingCIA1Marks || existingCIA1Marks.C1Q1 === null) {
        return res.status(409).json({
          error: {
            message: "CIA-1 marks do not exist for this student",
          },
        });
      }
    
      // Check if there is anything to update
      if (!resultData.ASG1 && !resultData.ASG2) {
        return res.status(400).json({
          error: {
            message: "Nothing to update",
          },
        });
      }
    
      // Prepare the data for update
      const updateData: any = {};
    
      if (resultData.ASG1 !== undefined) {
        updateData.ASG1 = resultData.ASG1;
        updateData.ASGCO1 = (resultData.ASG1 || 0) * (5/3);
      }
    
      if (resultData.ASG2 !== undefined) {
        updateData.ASG2 = resultData.ASG2;
        updateData.ASGCO2 = (resultData.ASG2 || 0) * (5/3);
      }
    
      // Update the assignment marks
      const updateAssignment = await prisma.marks.update({
        where: {
          id: existingCIA1Marks.id,
        },
        data: updateData,
      });
    
      return res.json({
        studentId: updateAssignment.studentId,
        success: "ASSIGMENT MARK is updated successfully",
      });
    }
    
    else if (exam == "ESE") {

      const data4 = ESESchema.safeParse(req.body);

      if (!data4.success) {
        let errMessage: string = fromZodError(data4.error).message;
        return res.status(400).json({
          error: {
            message: errMessage,
          },
        });
      }

      const resultData: ESEData = data4.data;

      if (!resultData) {
        return res.status(409).json({
          error: {
            message: "Invalid params",
          },
        });
      }

      // Check if CIA-2 marks exist for this student
      let existingESEMarks = await prisma.marks.findFirst({
        where: {
          studentId: student ? student.id : 0,
        },
      });
    
      if (!existingESEMarks || existingESEMarks.C2Q1 === null) {
        return res.status(409).json({
          error: {
            message: "CIA-2 marks do not exist for this student",
          },
        });
      }

      // Update the existing CIA-2 marks with the new data.
      const updatedESEMarks = await prisma.marks.update({
        where: {
          id: existingESEMarks.id,
        },
        data: {
          ESEQ1: resultData.ESEQ1,
          ESEQ2: resultData.ESEQ2,
          ESEQ3: resultData.ESEQ3,
          ESEQ4: resultData.ESEQ4,
          ESEQ5: resultData.ESEQ5,
          ESEQ6: resultData.ESEQ6,
          ESEQ7: resultData.ESEQ7,
          ESEQ8: resultData.ESEQ8,
          ESEQ9: resultData.ESEQ9,
          ESEQ10: resultData.ESEQ10,
          ESEQ11: resultData.ESEQ11,
          ESEQ12: resultData.ESEQ12,
          ESEQ13: resultData.ESEQ13,
          ESEQ14: resultData.ESEQ14,
          ESEQ15: resultData.ESEQ15,
          ESEQ16: resultData.ESEQ16,
          ESEQ17: resultData.ESEQ17,
          ESEQ18: resultData.ESEQ18,
          ESEQ19: resultData.ESEQ19,
          ESEQ20: resultData.ESEQ20,
          ESEQ21: resultData.ESEQ21,
          ESEQ22: resultData.ESEQ22,
          ESEQ23: resultData.ESEQ23,
          ESEQ24: resultData.ESEQ24,
          ESEQ25: resultData.ESEQ25,
          ESEQ26: resultData.ESEQ26,
          ESEQ27: resultData.ESEQ27,
          ESEQ28: resultData.ESEQ28,

          ESECO1: resultData.ESEQ1 + resultData.ESEQ2 + resultData.ESEQ5 + resultData.ESEQ6 + resultData.ESEQ9 + resultData.ESEQ10 + resultData.ESEQ13 + resultData.ESEQ14 + resultData.ESEQ17 + resultData.ESEQ18,
          ESECO2: resultData.ESEQ3 + resultData.ESEQ4 + resultData.ESEQ7 + resultData.ESEQ8 + resultData.ESEQ11 + resultData.ESEQ12 + resultData.ESEQ15 + resultData.ESEQ16 + resultData.ESEQ19 + resultData.ESEQ20 + resultData.ESEQ21,
          ESECO3: resultData.ESEQ22 + resultData.ESEQ23 + resultData.ESEQ26,
          ESECO4: resultData.ESEQ24 + resultData.ESEQ25 + resultData.ESEQ27,
          ESECO5: resultData.ESEQ28,

          ESESTATUS: resultData.ESESTATUS,
          ESESTAFF: resultData.ESESTAFF,    //ESE -2 staff initiall

          //extras total after the semester

        },
      });

      return res.json({
        success: "ESE MARK is added successfully"
      });

    } else {
      return res.status(404).json({
        error: {
          message: "Invalid Exam type",
        },
      });
    }

    // Return a success response
    res.status(201).json({
      success: {
        message: "Student record added successfully",
        student,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        message: "Internal server error",
      },
    });
  }
}

//get marks
async function getMarks(req: Request, res: Response) {
  const { code, department } = req.body;

  if (!code || !department) {
    return res.status(400).json({
      error: {
        message: "Missing required fields code or department.",
      },
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
      return res.status(400).json({ error: 'Department not found for the given code.' });
    }

    // Retrieve students associated with the department and code, including their marks
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

    // Calculate TCO values for each student
    const updatedStudents = students.map((student) => {
      // Calculate TCO values for each student
      const TCO1 = student.marks.reduce((total, mark) => {
        const C1CO1 = mark.C1CO1 || 0;
        const C2CO1 = mark.C2CO1 || 0;
        const ASGCO1 = mark.ASGCO1 || 0;
        return total + C1CO1 + C2CO1 + ASGCO1;
      }, 0);

      const TCO2 = student.marks.reduce((total, mark) => {
        const C1CO2 = mark.C1CO2 || 0;
        const C2CO2 = mark.C2CO2 || 0;
        const ASGCO2 = mark.ASGCO2 || 0;
        return total + C1CO2 + C2CO2 + ASGCO2;
      }, 0);

      const TCO3 = student.marks.reduce((total, mark) => {
        const C1CO3 = mark.C1CO3 || 0;
        const C2CO3 = mark.C2CO3 || 0;
        return total + C1CO3 + C2CO3;
      }, 0);

      const TCO4 = student.marks.reduce((total, mark) => {
        const C1CO4 = mark.C1CO4 || 0;
        const C2CO4 = mark.C2CO4 || 0;
        return total + C1CO4 + C2CO4;
      }, 0);

      const TCO5 = student.marks.reduce((total, mark) => {
        const C1CO5 = mark.C1CO5 || 0;
        const C2CO5 = mark.C2CO5 || 0;
        return total + C1CO5 + C2CO5;
      }, 0);

      return {
        id: student.id,
        TCO1: TCO1,
        TCO2: TCO2,
        TCO3: TCO3,
        TCO4: TCO4,
        TCO5: TCO5,
      };
    });

    // ...

    // Perform batch updates to update the TCO values in the marks table
    const updateresult = await Promise.all(
        updatedStudents.map(async (updatedStudent) => {
          await prisma.marks.updateMany({
            where: {
              studentId: updatedStudent.id,
            },
            data: {
              TCO1: updatedStudent.TCO1,
              TCO2: updatedStudent.TCO2,
              TCO3: updatedStudent.TCO3,
              TCO4: updatedStudent.TCO4,
              TCO5: updatedStudent.TCO5,
            },
          });
        })
      );

      if(!updateresult){
        return res.status(400).json({
          error: {
            message: "TCO's not updated",
          },
        });
      }

    // Create an object to hold updated marks data
    const updatedMarks = updatedStudents.map((updatedStudent) => {
      return {
        id: updatedStudent.id,
        TCO1: updatedStudent.TCO1,
        TCO2: updatedStudent.TCO2,
        TCO3: updatedStudent.TCO3,
        TCO4: updatedStudent.TCO4,
        TCO5: updatedStudent.TCO5,
      };
    });

    // Calculate the total number of students
    const totalStudents = updatedMarks.length;

    // Check TCO1 against the condition
    const above40TCO1 = updatedMarks.filter((student) => student.TCO1 >= 12);

    // Check TCO2 against the condition
    const above40TCO2 = updatedMarks.filter((student) => student.TCO2 >= 16);

    // Check TCO3 against the condition
    const above40TCO3 = updatedMarks.filter((student) => student.TCO3 >= 14);

    // Check TCO4 against the condition
    const above40TCO4 = updatedMarks.filter((student) => student.TCO4 >= 14);

    // Check TCO5 against the condition
    const above40TCO5 = updatedMarks.filter((student) => student.TCO5 >= 8);

    // Calculate the count of students meeting the above-40 condition for each TCO
    const countAbove40TCO1 = above40TCO1.length;
    const countAbove40TCO2 = above40TCO2.length;
    const countAbove40TCO3 = above40TCO3.length;
    const countAbove40TCO4 = above40TCO4.length;
    const countAbove40TCO5 = above40TCO5.length;

    // Calculate the percentage for each TCO
    const percentageTCO1 = (countAbove40TCO1 / totalStudents) * 100;
    const percentageTCO2 = (countAbove40TCO2 / totalStudents) * 100;
    const percentageTCO3 = (countAbove40TCO3 / totalStudents) * 100;
    const percentageTCO4 = (countAbove40TCO4 / totalStudents) * 100;
    const percentageTCO5 = (countAbove40TCO5 / totalStudents) * 100;

    // Create an object to hold all above-40 TCO values
    const above40TCO = {
      TCO1: above40TCO1.length,
      TCO2: above40TCO2.length,
      TCO3: above40TCO3.length,
      TCO4: above40TCO4.length,
      TCO5: above40TCO5.length,
    };

    // Define a function to calculate ATTAINLEVEL based on percentage
    const calculateAttainLevel = (percentage: number) => {
      return percentage < 40 ? 0 : percentage < 60 ? 1 : percentage < 75 ? 2 : 3;
    }

    const percentages = {
      TCO1: totalStudents > 0 ? (countAbove40TCO1 / totalStudents) * 100 : 0,
      TCO2: totalStudents > 0 ? (countAbove40TCO2 / totalStudents) * 100 : 0,
      TCO3: totalStudents > 0 ? (countAbove40TCO3 / totalStudents) * 100 : 0,
      TCO4: totalStudents > 0 ? (countAbove40TCO4 / totalStudents) * 100 : 0,
      TCO5: totalStudents > 0 ? (countAbove40TCO5 / totalStudents) * 100 : 0,
    };

    // Calculate ATTAINLEVEL for each TCO
    const attainLevelTCO1 = calculateAttainLevel(percentageTCO1);
    const attainLevelTCO2 = calculateAttainLevel(percentageTCO2);
    const attainLevelTCO3 = calculateAttainLevel(percentageTCO3);
    const attainLevelTCO4 = calculateAttainLevel(percentageTCO4);
    const attainLevelTCO5 = calculateAttainLevel(percentageTCO5);

    // Create an object to hold ATTAINLEVEL for each TCO
    const attainLevels = {
      TCO1: attainLevelTCO1,
      TCO2: attainLevelTCO2,
      TCO3: attainLevelTCO3,
      TCO4: attainLevelTCO4,
      TCO5: attainLevelTCO5,
    };

    // Create an object to hold the count of students meeting the condition for each ESECO field
    const countAbove12ESECO1 = students.filter((student) =>
      student.marks.some((mark) => mark.ESECO1 !== null && mark.ESECO1 >= 12)
    ).length;
    const countAbove16ESECO2 = students.filter((student) =>
      student.marks.some((mark) => mark.ESECO2 !== null && mark.ESECO2 >= 16)
    ).length;
    const countAbove14ESECO3 = students.filter((student) =>
      student.marks.some((mark) => mark.ESECO3 !== null && mark.ESECO3 >= 14)
    ).length;
    const countAbove14ESECO4 = students.filter((student) =>
      student.marks.some((mark) => mark.ESECO4 !== null && mark.ESECO4 >= 14)
    ).length;
    const countAbove8ESECO5 = students.filter((student) =>
      student.marks.some((mark) => mark.ESECO5 !== null && mark.ESECO5 >= 8)
    ).length;


    // Create an object to hold all above-40 ESECO values
    const above40ESECO = {
      ESECO1: countAbove12ESECO1,
      ESECO2: countAbove16ESECO2,
      ESECO3: countAbove14ESECO3,
      ESECO4: countAbove14ESECO4,
      ESECO5: countAbove8ESECO5,
    };

    const percentagesESECO = {
      ESECO1: 0,
      ESECO2: 0,
      ESECO3: 0,
      ESECO4: 0,
      ESECO5: 0,
    };
    
    // Calculate the percentage for each ESECO if there are students meeting the condition
    if (totalStudents > 0) {
      percentagesESECO.ESECO1 = (countAbove12ESECO1 / totalStudents) * 100;
      percentagesESECO.ESECO2 = (countAbove16ESECO2 / totalStudents) * 100;
      percentagesESECO.ESECO3 = (countAbove14ESECO3 / totalStudents) * 100;
      percentagesESECO.ESECO4 = (countAbove14ESECO4 / totalStudents) * 100;
      percentagesESECO.ESECO5 = (countAbove8ESECO5 / totalStudents) * 100;
    }
    
    // Calculate ATTAINLEVEL for each ESECO
    const attainLevelESECO1 = calculateAttainLevel(percentagesESECO.ESECO1);
    const attainLevelESECO2 = calculateAttainLevel(percentagesESECO.ESECO2);
    const attainLevelESECO3 = calculateAttainLevel(percentagesESECO.ESECO3);
    const attainLevelESECO4 = calculateAttainLevel(percentagesESECO.ESECO4);
    const attainLevelESECO5 = calculateAttainLevel(percentagesESECO.ESECO5);
    
    // Create an object to hold ATTAINLEVEL for each ESECO
    const attainLevelsESECO = {
      ESECO1: attainLevelESECO1,
      ESECO2: attainLevelESECO2,
      ESECO3: attainLevelESECO3,
      ESECO4: attainLevelESECO4,
      ESECO5: attainLevelESECO5,
      
    };

    let overAll = {
      CO1 : (attainLevels.TCO1 + attainLevelsESECO.ESECO1) / 2 ,
      CO2 : (attainLevels.TCO2 + attainLevelsESECO.ESECO2) / 2 ,
      CO3 : (attainLevels.TCO3 + attainLevelsESECO.ESECO3) / 2 ,
      CO4 : (attainLevels.TCO4 + attainLevelsESECO.ESECO4) / 2 ,
      CO5 : (attainLevels.TCO5 + attainLevelsESECO.ESECO5) / 2 ,
    }

    let averageAttainLevel = ( overAll.CO1 + overAll.CO2 + overAll.CO3 + overAll.CO4 + overAll.CO5 ) / 5

    let direct80 = (80 * averageAttainLevel) / 100

    const psoRecord = await prisma.pSO.findFirst({
      where: {
        code: {
          code: code,
        },
      },
    });

    if (!psoRecord) {
      return "PSO not found for given course code";
    }

    // Extract PSO1CO1 to PSO1CO5 values from the PSO record
    const { PSO1CO1, PSO1CO2, PSO1CO3, PSO1CO4, PSO1CO5, PSO2CO1, PSO2CO2, PSO2CO3, PSO2CO4, PSO2CO5, PSO3CO1, PSO3CO2, PSO3CO3, PSO3CO4, PSO3CO5, PSO4CO1, PSO4CO2, PSO4CO3, PSO4CO4, PSO4CO5, PSO5CO1, PSO5CO2, PSO5CO3, PSO5CO4, PSO5CO5 } = psoRecord;

    // Calculate the denominator (PSOCO1 + PSOCO2 + PSOCO3 + PSOCO4 + PSOCO5)
    const denominator1 = PSO1CO1 + PSO1CO2 + PSO1CO3 + PSO1CO4 + PSO1CO5;
    const denominator2 = PSO2CO1 + PSO2CO2 + PSO2CO3 + PSO2CO4 + PSO2CO5;
    const denominator3 = PSO3CO1 + PSO3CO2 + PSO3CO3 + PSO3CO4 + PSO3CO5;
    const denominator4 = PSO4CO1 + PSO4CO2 + PSO4CO3 + PSO4CO4 + PSO4CO5;
    const denominator5 = PSO5CO1 + PSO5CO2 + PSO5CO3 + PSO5CO4 + PSO5CO5;

    // Calculate PSA using the provided formula
    const PSA1 =
      (overAll.CO1 * PSO1CO1 +
        overAll.CO2 * PSO1CO2 +
        overAll.CO3 * PSO1CO3 +
        overAll.CO4 * PSO1CO4 +
        overAll.CO5 * PSO1CO5) /
      denominator1;

      const PSA2 =
      (overAll.CO1 * PSO2CO1 +
        overAll.CO2 * PSO2CO2 +
        overAll.CO3 * PSO2CO3 +
        overAll.CO4 * PSO2CO4 +
        overAll.CO5 * PSO2CO5) /
      denominator2;

      const PSA3 =
      (overAll.CO1 * PSO3CO1 +
        overAll.CO2 * PSO3CO2 +
        overAll.CO3 * PSO3CO3 +
        overAll.CO4 * PSO3CO4 +
        overAll.CO5 * PSO3CO5) /
      denominator3;

      const PSA4 =
      (overAll.CO1 * PSO3CO1 +
        overAll.CO2 * PSO4CO2 +
        overAll.CO3 * PSO4CO3 +
        overAll.CO4 * PSO4CO4 +
        overAll.CO5 * PSO4CO5) /
      denominator4;

      const PSA5 =
      (overAll.CO1 * PSO5CO1 +
        overAll.CO2 * PSO5CO2 +
        overAll.CO3 * PSO5CO3 +
        overAll.CO4 * PSO5CO4 +
        overAll.CO5 * PSO5CO5) /
      denominator5;

      const PSA = {
        PSA1: PSA1,
        PSA2: PSA2,
        PSA3: PSA3,
        PSA4: PSA4,
        PSA5: PSA5,
      }

      const PsaMean = (PSA.PSA1 + PSA.PSA2 + PSA.PSA3 + PSA.PSA4 + PSA.PSA5) / 5

    // Send the attainLevels, above40TCO, and above40ESECO as part of your JSON response
    return res.status(200).json({ 
      message: 'Marks updated successfully.', 
      above40TCO,
      percentages,
      attainLevels,
      above40ESECO,
      percentagesESECO,
      attainLevelsESECO,
      overAll,
      averageAttainLevel,
      direct80,
      PSA,
      PsaMean
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

//addPso
async function addPso(req: Request, res: Response) {
  const data = psoSchema.safeParse(req.body);

  if (!data.success) {
    let errMessage = fromZodError(data.error).message;
    return res.status(400).json({
      error: {
        message: errMessage,
      },
    });
  }

  try {
    const resultData = data.data;

    if (!resultData) {
      return res.status(409).json({
        error: {
          message: "Invalid params",
        },
      });
    }

    const existingCode = await prisma.code.findFirst({
      where: {
        code: resultData.code,
      },
    });

    if (existingCode) {
      const addPSO = await prisma.pSO.create({
        data: {
          codeId: existingCode.id,
          PSO1CO1: resultData.PSO1CO1,
          PSO1CO2: resultData.PSO1CO2,
          PSO1CO3: resultData.PSO1CO3,
          PSO1CO4: resultData.PSO1CO4,
          PSO1CO5: resultData.PSO1CO5,
          PSO2CO1: resultData.PSO2CO1,
          PSO2CO2: resultData.PSO2CO2,
          PSO2CO3: resultData.PSO2CO3,
          PSO2CO4: resultData.PSO2CO4,
          PSO2CO5: resultData.PSO2CO5,
          PSO3CO1: resultData.PSO3CO1,
          PSO3CO2: resultData.PSO3CO2,
          PSO3CO3: resultData.PSO3CO3,
          PSO3CO4: resultData.PSO3CO4,
          PSO3CO5: resultData.PSO3CO5,
          PSO4CO1: resultData.PSO4CO1,
          PSO4CO2: resultData.PSO4CO2,
          PSO4CO3: resultData.PSO4CO3,
          PSO4CO4: resultData.PSO4CO4,
          PSO4CO5: resultData.PSO4CO5,
          PSO5CO1: resultData.PSO5CO1,
          PSO5CO2: resultData.PSO5CO2,
          PSO5CO3: resultData.PSO5CO3,
          PSO5CO4: resultData.PSO5CO4,
          PSO5CO5: resultData.PSO5CO5,
        },
      });

      return res.status(201).json({
        success: {
          message: "PSO added successfully",
        },
      });
    } else {
      return res.status(404).json({
        error: {
          message: "Course code does not exist",
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: {
        message: "Internal server error",
      },
    });
  }
}

//searchDepartment
async function searchDepartment(req: Request, res: Response) {
  const { question } = req.query;

  try {
    if (question) {
      const departments = await prisma.department.findMany({
        where: {
          departmentCode: {
            contains: question as string,
          },
        },
      });
      return res.status(200).json({
        data: departments,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: {
        message: "Internal server error",
      },
    });
  }
}

//get Marks by code
async function getMarkByCode(req: Request, res: Response) {
  const { code, department } = req.body;

  try {
    // Check if the department exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        departmentCode: department,
      },
    });

    if (!existingDepartment) {
      return res.status(400).json({
        error: 'Department not found for the given code.',
      });
    }

    // Check if the code exists
    const existingCode = await prisma.code.findFirst({
      where: {
        code: code,
      },
    });

    if (!existingCode) {
      return res.status(400).json({
        error: 'Code not found.',
      });
    }

    // Retrieve students associated with the department and code, including their marks
    const students = await prisma.student.findMany({
      where: {
        code: {
          code: code,
        },
        codeId: existingDepartment.id,
      },
      include: {
        marks: true,
      },
    });

    // Return the students and their marks
    res.status(200).json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}
