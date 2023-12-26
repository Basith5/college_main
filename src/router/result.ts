import express, { Request, Response, response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { fromZodError } from "zod-validation-error"
import { ESEData, ESESchema, assignmentData, assignmentSchema, cia1Data, cia1Schema, cia2Data, cia2Schema, psoData, psoSchema } from '../model/result';
import { CourseOutCome, DepartmentOutcome, ProgramOutcome, StudentOutcome } from './Outcome/outcomes';

const prisma = new PrismaClient();


export const userRouter = express.Router();

//Routes
userRouter.post("/addMarks", addMark);
userRouter.post("/addPso", addPso);

userRouter.put("/getStudent", StudentOutcome);
userRouter.put("/getMarks", CourseOutCome);
userRouter.put("/getByDepartment", DepartmentOutcome)
userRouter.put("/getByCategory", ProgramOutcome)

userRouter.get("/searchDepartment", searchDepartment);
userRouter.get("/getMarkByCode", getMarkByCode);
userRouter.put("/byCode", getMarksWithCode);
userRouter.get("/searchCode", getCode);
userRouter.put("/deleteMark", deleteMark)
userRouter.get("/getStaff", getStaff)

// userRouter.put("/addDep", addDep)
// userRouter.put("/addCourse", addCourseAutomate)
userRouter.put("/addMarksAutomates", addMarksAutomate)
userRouter.get("/getStaffsDetails", getByCourseStaffTaken)

userRouter.get("/getAllCourses", getAllCourses)
userRouter.post("/AddNewCourse", addNewCourse)
userRouter.delete("/deleteCourse", deleteCourse)

userRouter.get("/getAllDepartment", getAllDepartment)
userRouter.post("/AddNewDepartment", addNewCourse)
userRouter.delete("/deleteDepartment", deleteCourse)

//#region sa
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
    if (exam == "C1") {
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
            C1LOT: resultData.C1LOT,
            C1MOT: resultData.C1MOT,
            C1HOT: resultData.C1HOT,
            C1STATUS: resultData.C1STATUS,
            C1STAFF: resultData.C1STAFF,
            studentId: student ? student.id : 0,
          },
        });

        return res.json({
          success: "CIA-1 marks are updated successfully",
        });
      }

      // If marks do not exist, create them
      const mark = await prisma.marks.create({
        data: {
          C1LOT: resultData.C1LOT,
          C1MOT: resultData.C1MOT,
          C1HOT: resultData.C1HOT,
          C1STATUS: resultData.C1STATUS,
          C1STAFF: resultData.C1STAFF,
          studentId: student ? student.id : 0,
        },
      });

      return res.json({
        success: "CIA-1 marks are added successfully",
      });
    }

    else if (exam === "C2") {
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

      if (!existingCIA1Marks || existingCIA1Marks.C1LOT === null) {
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
          C2LOT: resultData.C2LOT,
          C2MOT: resultData.C2MOT,
          C2HOT: resultData.C2HOT,
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

      // Check if assignment marks exist for this student
      let existingAssignmentMarks = await prisma.marks.findFirst({
        where: {
          studentId: student ? student.id : 0,
        },
      });

      if (!existingAssignmentMarks) {
        return res.status(409).json({
          error: {
            message: "Assignment marks do not exist for this student",
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

      if (resultData.ASG1 !== undefined && resultData.ASG1STAFF !== undefined) {
        updateData.ASG1 = resultData.ASG1;
        updateData.ASGCO1 = (resultData.ASG1 || 0) * (5 / 3);
        updateData.ASG1STAFF = resultData.ASG1STAFF;
      }

      if (resultData.ASG2 !== undefined && resultData.ASG2STAFF !== undefined) {
        updateData.ASG2 = resultData.ASG2;
        updateData.ASGCO2 = (resultData.ASG2 || 0) * (5 / 3);
        updateData.ASG2STAFF = resultData.ASG2STAFF;
      }

      // Update the assignment marks
      const updateAssignment = await prisma.marks.update({
        where: {
          id: existingAssignmentMarks.id,
        },
        data: updateData,
      });

      return res.json({
        studentId: updateAssignment.studentId,
        success: "ASSIGNMENT MARKS are updated successfully",
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

      if (!existingESEMarks || existingESEMarks.C2LOT === null) {
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
          ELOT: resultData.ELOT,
          EMOT: resultData.EMOT,
          EHOT: resultData.EHOT,
          ESTATUS: resultData.ESESTATUS,
          ESTAFF: resultData.ESESTAFF,    //ESE -2 staff initiall

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
//#endregion


//#region addPso
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

      const existingpso = await prisma.pSO.findFirst({
        where: {
          codeId: existingCode.id,
        },
      });

      if (existingpso) {
        const updatePSO = await prisma.pSO.update({
          where: {
            id: existingpso.id
          },
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
      }
      else {
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
      }

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
//#endregion

//#region searchDepartment
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
//#endregion

//#region getCode
async function getCode(req: Request, res: Response) {
  const { question, uname } = req.query;

  try {
    if (question) {

      const where: { depCode: string; uname?: string } = {
        depCode: question as string,
      };

      if (uname !== "all") {
        where.uname = uname as string;
      }

      const Courses = await prisma.code.findMany({
        where: where,
      });

      return res.status(200).json({
        data: Courses,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: {
        message: "Internal server error",
      },
    });
  }
}
//#endregion

//#region get Marks by code
async function getMarkByCode(req: Request, res: Response) {
  const { code, department, page, pageSize, sortby } = req.query;

  try {
    // Check if the department exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        departmentCode: department?.toString(),
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
        code: code?.toString(),
        depCode: existingDepartment.departmentCode
      },
    });

    if (!existingCode) {
      return res.status(400).json({
        error: 'Code not found.',
      });
    }

    // Calculate pagination parameters
    const pageNumber = parseInt(page?.toString() || '1', 15);
    const pageSizeNumber = parseInt(pageSize?.toString() || '10', 15);
    const skip = (pageNumber - 1) * pageSizeNumber;

    // Retrieve students associated with the department and code, including their marks
    const students = await prisma.student.findMany({
      where: {
        codeId: existingCode.id,
      },
      include: {
        marks: true,
      },
      orderBy: {
        id: sortby == 'true' ? "asc" : "desc",
      },
      skip, // Skip records based on the page number
      take: pageSizeNumber, // Limit the number of records per page
    });

    console.log(students)

    // Calculate the total number of students that match the query
    const totalStudentsCount = await prisma.student.count({
      where: {
        code: {
          code: code?.toString(),
        },
        codeId: existingCode.id,
      },
    });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalStudentsCount / pageSizeNumber);

    // Return the students, their marks, and the total number of pages
    res.status(200).json({ data: students, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

//#endregion

//#region deleteMark
async function deleteMark(req: Request, res: Response) {
  console.log(req.body)
  try {
    const { id, exam } = req.body;

    if (!id || !exam) {
      return res.status(400).json({
        error: "Params missing id or exam"
      });
    }

    if (typeof id !== 'number') {
      return res.status(400).json({
        error: "Invalid ID. ID must be a number."
      });
    }

    const mark = await prisma.marks.findUnique({
      where: {
        id: id,
      }
    });

    if (!mark) {
      return res.status(404).json({
        error: "Mark not found"
      });
    }

    // Check if specific fields (e.g., C1Q1, C2Q1, ESEQ1) are null
    if (
      (mark.C1LOT === null && mark.C2LOT === null) ||
      (mark.C2LOT === null && mark.ELOT === null) ||
      (mark.ELOT === null && mark.C1LOT === null)
    ) {
      const studentId = mark.studentId;

      // Delete the record from the marks table
      await prisma.marks.delete({
        where: {
          id: id
        }
      });

      // Delete the corresponding record from the student table
      await prisma.student.delete({
        where: {
          id: studentId
        }
      });

      return res.status(200).json({
        success: "Mark deleted successfully",
      });
    }

    // Create an object to specify the fields to update based on the exam type
    const updateFields: Record<string, null> = {}; // Specify the type

    if (exam === "C1") {

      updateFields[`C1LOT`] = null;
      updateFields[`C1MOT`] = null;
      updateFields[`C1HOT`] = null;

      updateFields[`TLOT`] = null;
      updateFields[`TMOT`] = null;
      updateFields[`THOT`] = null;

      updateFields["C1STATUS"] = null;
      updateFields["C1STAFF"] = null;

    } else if (exam === "C2") {
      updateFields[`C2LOT`] = null;
      updateFields[`C2MOT`] = null;
      updateFields[`C2HOT`] = null;

      updateFields[`TLOT`] = null;
      updateFields[`TMOT`] = null;
      updateFields[`THOT`] = null;

      updateFields["C2STATUS"] = null;
      updateFields["C2STAFF"] = null;

    } else if (exam === "ESE") {
      updateFields[`ELOT`] = null;
      updateFields[`EMOT`] = null;
      updateFields[`EHOT`] = null;

      updateFields["ESTATUS"] = null;
      updateFields["ESTAFF"] = null;

    } else {
      return res.status(404).json({
        error: "Invalid exam type"
      });
    }


    // Update the specified fields in the marks table
    await prisma.marks.update({
      where: {
        id: id,
      },
      data: updateFields,
    });

    return res.status(200).json({
      success: "Successfully marks updated to null",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}
//#endregion

//#region get marks by code
async function getMarksWithCode(req: Request, res: Response) {
  try {
    const { department, code, regNo } = req.body;

    if (!department || !code || !regNo) {
      return res.status(400).json({
        error: "Missing required parameters: department, code, or regNo",
      });
    }

    if (typeof department !== 'string') {
      return res.status(400).json({
        error: "department is string."
      });
    }

    if (typeof code !== 'string') {
      return res.status(400).json({
        error: "code is string."
      });
    }

    if (typeof regNo !== 'string') {
      return res.status(400).json({
        error: "regNo is string."
      });
    }

    const dep = await prisma.code.findFirst({
      where: {
        depCode: {
          contains: department.toUpperCase()
        }
      }
    })

    const coder = await prisma.code.findFirst({
      where: {
        code: code,
      }
    })

    const reg1 = await prisma.student.findFirst({
      where: {
        regNo: regNo,
      }
    })

    // return res.json({
    //   msg : {reg1,coder,dep}
    // })

    // Query the database to get the marks based on department, code, and regNo
    const marks = await prisma.marks.findMany({
      where: {
        student: {
          regNo: regNo,
          code: {
            department: {
              departmentCode: department,
            },
            code: code,
          },
        },
      },
    });

    if (marks.length === 0) {
      return res.status(200).json({
        msg: "No data found for given details"
      })
    }

    return res.status(200).json({
      success: "Marks retrieved successfully",
      marks: marks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

//#endregion

//#region getby CourseStaffTaken
async function getByCourseStaffTaken(req: Request, res: Response) {
  const { uname } = req.query

  if (!uname) {
    return res.status(400).json({
      error: {
        message: "Id missing",
      }
    });
  }

  try {

    const getDetails = await prisma.staff.findMany({
      where: {
        uname: String(uname)
      },
      include: {
        code: {
          include: {
            pso: true
          }
        },

      }
    })

    if (getDetails) {
      return res.status(200).json({
        data: getDetails
      });
    }

    return res.status(500).json({
      error: {
        message: "An error occurred while fetching data",
      }
    });


  } catch (error) {

    return res.status(500).json({
      error: {
        message: "An error occurred while fetching data",
      }
    });
  }



}

//#endregion

//#region getAllCourses
async function getAllCourses(req: Request, res: Response) {
  const { page } = req.query

  try {

    const pageNumber = parseInt(page?.toString() || '1', 10);
    const pageSizeNumber = parseInt('10', 10);
    const skip = (pageNumber - 1) * pageSizeNumber;

    const getData = await prisma.code.findMany({
      skip, // Skip records based on the page number
      take: pageSizeNumber,
      orderBy: {
        depCode: "asc",
      },

    })

    const getDataCount = await prisma.code.count()

    const totalPages = Math.ceil(getDataCount / pageSizeNumber);

    if (!getData) {
      return res.status(500).json({
        error: {
          message: "No data",
        }
      });
    }

    return res.status(200).json({
      data: getData,
      totalPages
    });



  } catch (error) {

    return res.status(500).json({
      error: {
        message: "An error occurred while fetching data",
      }
    });
  }



}
//#endregion

//#region addNewCourse
async function addNewCourse(req: Request, res: Response) {
  const { code, depCode, name } = req.body

  if (!code || !depCode || !name) {
    return res.status(500).json({
      error: {
        message: "",
      }
    });
  }

  try {
    const checkExisting = await prisma.code.findFirst({
      where: {
        code: String(code),
        depCode: String(depCode)
      }
    })

    if (checkExisting) {
      return res.status(500).json({
        error: {
          message: "Already Exist",
        }
      });
    }


    await prisma.code.create({
      data: {
        code: String(code),
        name: String(name),
        depCode: String(depCode),
        uname: "none"
        // Map other CSV columns to your Prisma model fields
      },
    });

    return res.status(200).json({
      success: "Successfully Added"
    });
  }
  catch (e) {
    return res.status(500).json({
      error: {
        message: e,
      }
    });
  }

}
//#endregion

//#region addNewCourse
async function deleteCourse(req: Request, res: Response) {
  const { id } = req.query

  if (!id) {
    return res.status(500).json({
      error: {
        message: "id not found",
      }
    });
  }

  try {
    const checkExisting = await prisma.code.findFirst({
      where: {
        id: Number(id)
      }
    })

    if (checkExisting) {
      const deleteCourse = await prisma.code.delete({
        where: {
          id: Number(id)
        },
        include: {
          students: true,
        }
      })

      return res.status(200).json({
        success: 'Deleted'
      })
    }
    else {
      return res.status(500).json({
        error: {
          message: 'Not Found'
        }
      });
    }

  }
  catch (e) {
    return res.status(500).json({
      error: {
        message: e,
      }
    });
  }

}
//#endregion

//#region getAllDepartment
async function getAllDepartment(req: Request, res: Response) {
  const { page } = req.query

  try {

    const pageNumber = parseInt(page?.toString() || '1', 10);
    const pageSizeNumber = parseInt('10', 10);
    const skip = (pageNumber - 1) * pageSizeNumber;

    const getData = await prisma.department.findMany({
      skip, // Skip records based on the page number
      take: pageSizeNumber,
      orderBy: {
        name: "asc",
      },

    })

    const getDataCount = await prisma.department.count()

    const totalPages = Math.ceil(getDataCount / pageSizeNumber);

    if (!getData) {
      return res.status(500).json({
        error: {
          message: "No data",
        }
      });
    }

    return res.status(200).json({
      data: getData,
      totalPages
    });



  } catch (error) {

    return res.status(500).json({
      error: {
        message: "An error occurred while fetching data",
      }
    });
  }



}
//#endregion

//#region addNewDepartment
async function addNewDepartment(req: Request, res: Response) {
  const { code, depCode, name } = req.body

  if (!code || !depCode || !name) {
    return res.status(500).json({
      error: {
        message: "",
      }
    });
  }

  try {
    const checkExisting = await prisma.code.findFirst({
      where: {
        code: String(code),
        depCode: String(depCode)
      }
    })

    if (checkExisting) {
      return res.status(500).json({
        error: {
          message: "Already Exist",
        }
      });
    }


    await prisma.code.create({
      data: {
        code: String(code),
        name: String(name),
        depCode: String(depCode),
        uname: "none"
        // Map other CSV columns to your Prisma model fields
      },
    });

    return res.status(200).json({
      success: "Successfully Added"
    });
  }
  catch (e) {
    return res.status(500).json({
      error: {
        message: e,
      }
    });
  }

}
//#endregion

//#region DeleteDepartment
async function deleteDepartment(req: Request, res: Response) {
  const { id } = req.query

  if (!id) {
    return res.status(500).json({
      error: {
        message: "id not found",
      }
    });
  }

  try {
    const checkExisting = await prisma.code.findFirst({
      where: {
        id: Number(id)
      }
    })

    if (checkExisting) {
      const deleteCourse = await prisma.code.delete({
        where: {
          id: Number(id)
        },
        include: {
          students: true,
        }
      })

      return res.status(200).json({
        success: 'Deleted'
      })
    }
    else {
      return res.status(500).json({
        error: {
          message: 'Not Found'
        }
      });
    }

  }
  catch (e) {
    return res.status(500).json({
      error: {
        message: e,
      }
    });
  }

}
//#endregion


//automation part
//#region get the staff
//get the staff
// async function getStaff(req: Request, res: Response) {
//   try {
//     const uname = req.query.uname as string;
//     const department = req.query.department as string;

//     if (!uname || !department) {
//       return res.status(400).json({ error: "'uname' and 'department' query parameters are required." });
//     }

//     const staffRecords = await prisma.staff.findMany({
//       where: { uname: uname },
//       select: {
//         code: true,
//       },
//     });

//     if (!staffRecords || staffRecords.length === 0) {
//       return res.status(404).json({ error: "No staff records found for the provided uname and department." });
//     }

//     const codeNames = staffRecords
//       .filter((record) => record.code.depCode === department)
//       .map((record) => record.code.name);

//     res.status(200).json({ codeNames: codeNames });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// }

async function getStaff(req: Request, res: Response) {
  try {
    const uname = req.query.uname as string;
    const department = req.query.department as string;

    if (!uname || !department) {
      return res.status(400).json({ error: "'uname' and 'department' query parameters are required." });
    }

    let staffRecords;

    if (uname !== 'admin') {
      staffRecords = await prisma.staff.findMany({
        where: { uname: uname },
        select: {
          code: {
            select: { name: true, depCode: true, code: true }, // Include code in the selection
          },
        },
      });
    }
    else {
      staffRecords = await prisma.staff.findMany({
        select: {
          code: {
            select: { name: true, depCode: true, code: true }, // Include code in the selection
          },
        },
      });
    }


    if (!staffRecords || staffRecords.length === 0) {
      return res.status(404).json({ error: "No staff records found for the provided uname and department." });
    }

    const codeInfo = staffRecords
      .filter((record) => record.code.depCode === department)
      .map((record) => {
        return {
          name: record.code.name,
          depCode: record.code.depCode,
          courseCode: record.code.code, // Include course code in the response
        };
      });

    res.status(200).json({ codeInfo: codeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
}



//#endregion

// async function addDep() {

//   let results = [

//     // { depCode: "UEC", name: "ECONOMICS" },
//     // { depCode: "UEN", name: "ENGLISH" },
//     // { depCode: "UFT", name: "FASHION TECHNOLOGY AND COSTUME DESIGNING" },
//     // { depCode: "UHS", name: "HISTORY" },
//     // { depCode: "UHM", name: "HOTEL MANAGEMENT AND CATERING SCIENCE" },
//     // { depCode: "UMA", name: "MATHEMATICS" },
//     // { depCode: "UTA", name: "TAMIL" },
//     // { depCode: "UVC", name: "VISUAL COMMUNICATION" },
//     // { depCode: "PAR", name: "ARABIC" },
//     // { depCode: "PCO", name: "COMMERCE" },
//     // { depCode: "PEC", name: "ECONOMICS" },
//     // { depCode: "PEN", name: "ENGLISH" },
//     // { depCode: "PFT", name: "FASHION TECHNOLOGY" },
//     // { depCode: "PHS", name: "HISTORY" },
//     // { depCode: "PMA", name: "MATHEMATICS" },
//     // { depCode: "PTA", name: "TAMIL" },
//     // { depCode: "MBA", name: "BUSINESS ADMINISTRATION" },
//     {depCode: "UCH",name: "CHEMISTRY"},
//     {depCode: "UCA",name: "COMPUTER APPLICAIONS"},
//     {depCode: "UCS",name: "COMPUTER SCIENCE"},
//     {depCode: "UIT",name: "INFORMATION TECHNOLOGY"},
//     {depCode: "UMB",name: "MICROBIOLOGY"},
//     {depCode: "UND",name: "NUTRITION AND DIETICS"},
//     {depCode: "UPH",name: "PHYSICS"},
//     {depCode: "UZO", name: "ZOOLOGY"},
//     { depCode: "PBO", name: "BOTANY" },
//     { depCode: "PBT", name: "BIOTECHNOLOGY" },
//     { depCode: "PCH", name: "CHEMISTRY" },
//     { depCode: "PCS", name: "COMPUTER SCIENCE" },
//     { depCode: "PIT", name: "INFORMATION TECHNOLOGY" },
//     { depCode: "PMB", name: "MICROBIOLOGY" },
//     { depCode: "PND", name: "NUTRITION AND DIETICS" },
//     { depCode: "PPH", name: "PHYSICS" },
//     { depCode: "PZO", name: "ZOOLOGY" },
//     { depCode: "MCA", name: "COMPUTER APPLICAIONS" }

//   ];

//   // Process and insert data into the Prisma database
//   for (const row of results) {
//     await prisma.department.create({
//       data: {
//         departmentCode: row.depCode,
//         name: row.name,
//         catagory: "Science"
//         // Map other CSV columns to your Prisma model fields
//       },
//     });
//   }

//   console.log('CSV data uploaded successfully');
//   await prisma.$disconnect();
// }

// async function addCourseAutomate() {


//   // Process and insert data into the Prisma database
//   for (const row of dd) {

//     try {
//       await prisma.code.create({
//         data: {
//           code: row.Sub_Code,
//           name: row.Title,
//           depCode: row.course_id,
//           uname: "none"
//           // Map other CSV columns to your Prisma model fields
//         },
//       });
//     }
//     catch (e) {
//       console.log(row.course_id)
//     }

//   }

//   console.log('Course data uploaded successfully');
//   await prisma.$disconnect();
// }

//#region Add Marks
async function addMarksAutomate(req: Request, res: Response) {

  let exam: string = 'ASG';
  const code = '23PMA1CC4';
  const department = 'PMA';
  const claass = 'PMA';
  const section = 'a';
  const staff = 'Mohamed Thoiyab N';




  try {


    for (let i = 1; i < 11; i++) {

      let regNo = '23' + department + String(i).padStart(3, '0')

      let Markdata = {
        "LOT": Math.round(Math.random() * 12),
        "MOT": Math.round(Math.random() * 18),
        "HOT": Math.round(Math.random() * 19),
        "STATUS": "present",
        "STAFF": staff,
      }

      let MarkdataAss = {
        "ASG1": Math.round(Math.random() * 3),
        "ASG2": Math.round(Math.random() * 3),
      }

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
      if (exam === "C1") {


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
              C1LOT: Markdata.LOT,
              C1MOT: Markdata.MOT,
              C1HOT: Markdata.HOT,

              C1STATUS: Markdata.STATUS,
              C1STAFF: Markdata.STAFF,
              studentId: student ? student.id : 0,
            },
          });

          return res.json({
            success: "CIA-1 marks are updated successfully",
          });
        }

        // If marks do not exist, create them
        const mark = await prisma.marks.create({
          data: {
            C1LOT: Markdata.LOT,
            C1MOT: Markdata.MOT,
            C1HOT: Markdata.HOT,

            C1STATUS: Markdata.STATUS,
            C1STAFF: Markdata.STAFF,
            studentId: student ? student.id : 0,

          },
        });


      }

      else if (exam === "C2") {
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
              C2LOT: Markdata.LOT,
              C2MOT: Markdata.MOT,
              C2HOT: Markdata.HOT,

              C2STATUS: Markdata.STATUS,
              C2STAFF: Markdata.STAFF,
              studentId: student ? student.id : 0,

            },
          });

        }
        else {

        }
      }

      else if (exam === "ASG") {

        // Update the assignment marks
        let marks = await prisma.marks.findFirst({
          where: {
            studentId: student ? student.id : 0,
          },
        });

        if (marks) {
          const updateAssignment = await prisma.marks.update({
            where: {
              id: marks.id,
            },
            data: {
              ASG1: MarkdataAss.ASG1,
              ASGCO1: Math.round((MarkdataAss.ASG1 || 0) * (5 / 3)),
              ASG1STAFF: staff,
              ASG2: MarkdataAss.ASG2,
              ASGCO2: Math.round((MarkdataAss.ASG2 || 0) * (5 / 3)),
              ASG2STAFF: staff,
            },
          });
        }
        else {
          console.log('no')
        }

      }

      else if (exam === "ESE") {
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
              ELOT: Markdata.LOT,
              EMOT: Markdata.MOT,
              EHOT: Markdata.HOT,

              ESTATUS: Markdata.STATUS,
              ESTAFF: Markdata.STAFF,
              studentId: student ? student.id : 0,

            },
          });
        }
        else {
          console.log('no')
        }


      } else {
        return res.status(404).json({
          error: {
            message: "Invalid Exam type",
          },
        });
      }
    }
    console.log('sad')


  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        message: "Internal server error",
      },
    });
  }

}
//#endregion
