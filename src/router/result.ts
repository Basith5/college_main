import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { fromZodError } from "zod-validation-error"
import { psoSchema } from '../model/result';
import { CourseOutCome, DepartmentOutcome, ProgramOutcome, StudentOutcome } from './Outcome/outcomes';
import { addNewCourse, deleteCourse, excelCourse, getAllCourses } from './Course/course';
import { upload } from './common';
import { addMark, deleteMark, excelMarks, getMarkByCode } from './marks/marks';
import { addNewDepartment, deleteDepartment, getAllDepartment } from './department/department';
import { getAllStaff, getByCourseStaffTaken, getStaff } from './Staff/staff';

const prisma = new PrismaClient();
export const userRouter = express.Router();

//marks
userRouter.post("/addMarks", addMark);
userRouter.post('/addMarksByExcel', upload.single('Excel'), excelMarks)
userRouter.get("/getMarkByCode", getMarkByCode);
userRouter.put("/deleteMark", deleteMark)
//outcomes
userRouter.put("/getStudent", StudentOutcome);
userRouter.put("/getMarks", CourseOutCome);
userRouter.put("/getByDepartment", DepartmentOutcome)
userRouter.put("/getByCategory", ProgramOutcome)
//course manage
userRouter.get("/getAllCourses", getAllCourses)
userRouter.post('/addCourseByExcel', upload.single('Excel'), excelCourse)
userRouter.post("/AddNewCourse", addNewCourse)
userRouter.delete("/deleteCourse", deleteCourse)
//department manage
userRouter.get("/getAllDepartment", getAllDepartment)
userRouter.post("/AddNewDepartment", addNewDepartment)
userRouter.delete("/deleteDepartment", deleteDepartment)
//staff
userRouter.get("/getStaffsDetails", getByCourseStaffTaken)
userRouter.get("/getAllStaff", getAllStaff)
userRouter.get("/getStaff", getStaff)
//others
userRouter.post("/addPso", addPso);
userRouter.get("/searchDepartment", searchDepartment);
userRouter.put("/byCode", getMarksWithCode);
userRouter.get("/searchCode", getCode);

//automate
userRouter.put("/addMarksAutomates", addMarksAutomate)
// userRouter.put("/addDep", addDep)
// userRouter.put("/addCourse", addCourseAutomate)
// userRouter.get("/getadd", uploadCSV)



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


// #region Add Marks
async function addMarksAutomate(req: Request, res: Response) {

  let exam: string = 'ESE';
  const code = '23MCA1CC3';
  const department = 'MCA';
  const claass = 'MCA';
  const section = 'a';
  const staff = 'ABDUL QADIR O S';




  try {


    for (let i = 93; i < 111; i++) {

      let regNo = '23' + department + String(i).padStart(3, '0')

      let Markdata = {
        "LOT": Math.round(Math.random() * 29),
        "MOT": Math.round(Math.random() * 36),
        "HOT": Math.round(Math.random() * 10),
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
              ESELOT: Markdata.LOT,
              ESEMOT: Markdata.MOT,
              ESEHOT: Markdata.HOT,

              ESESTATUS: Markdata.STATUS,
              ESESTAFF: Markdata.STAFF,
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
// #endregion


// async function uploadCSV() {

//   // Process and insert data into the Prisma database
//   for (const row of results) {
//     let exam: string = row.Exam;
//     const code = '23MCA1CC3';
//     const department = 'MCA';
//     const claass = 'MCA';
//     const section = 'A';
//     const staff = 'Jmc Admin';
//     let Markdata: { LOT: any; MOT: any; HOT: any; STATUS: any; STAFF: any; }

//     try {
//       let regNo = row['Register Number']


//       const check = await prisma.code.findFirst({
//         where: {
//           depCode: department,
//           code: code,
//         },
//       });

//       if (!check) {
//         return
//       }

//       // Check if the student exists
//       let student = await prisma.student.findFirst({
//         where: {
//           codeId: check.id,
//           regNo: regNo,
//         },
//       });

//       if (!student) {
//         student = await prisma.student.create({
//           data: {
//             regNo: regNo,
//             claass: claass,
//             section: section,
//             codeId: check.id,
//           },
//         });

//         if (!student) {
//           return
//         }
//       }


//       // Now, create the marks
//       if (exam === "CIA - I") {


//         let marks = await prisma.marks.findFirst({
//           where: {
//             studentId: student ? student.id : 0,
//           },
//         });

//         if (marks) {
//           // Marks already exist, update them
//           const updatedMark = await prisma.marks.update({
//             where: { id: marks.id }, // Assuming there's an ID for the existing mark
//             data: {
//               C1LOT: Number(row.LOT),
//               C1MOT: Number(row.MOT),
//               C1HOT: Number(row.HOT),
//               C1STATUS: 'present',
//               C1STAFF: staff,
//               studentId: student ? student.id : 0,
//             },
//           });

//           return
//         }

//         // If marks do not exist, create them
//         const mark = await prisma.marks.create({
//           data: {
//             C1LOT: Number(row.LOT),
//             C1MOT: Number(row.MOT),
//             C1HOT: Number(row.HOT),
//             C1STATUS: 'present',
//             C1STAFF: staff,
//             studentId: student ? student.id : 0,

//           },
//         });


//       }
//       else if (exam === "CIA - II") {
//         let marks = await prisma.marks.findFirst({
//           where: {
//             studentId: student ? student.id : 0,
//           },
//         });

//         if (marks) {
//           // Marks already exist, update them
//           const updatedMark = await prisma.marks.update({
//             where: { id: marks.id }, // Assuming there's an ID for the existing mark
//             data: {
//               C2LOT: Number(row.LOT),
//               C2MOT: Number(row.MOT),
//               C2HOT: Number(row.HOT),
//               C2STATUS: 'present',
//               C2STAFF: staff,
//               studentId: student ? student.id : 0,

//             },
//           });

//         }
//         else {

//         }
//       }
//       else if (exam === "Ass - I") {

//         // Update the assignment marks
//         let marks = await prisma.marks.findFirst({
//           where: {
//             studentId: student ? student.id : 0,
//           },
//         });

//         if (marks) {
//           const updateAssignment = await prisma.marks.update({
//             where: {
//               id: marks.id,
//             },
//             data: {
//               ASG1: Number(row.LOT),
//               ASGCO1: Math.round((Number(row.LOT) || 0) * (5 / 3)),
//               ASG1STAFF: staff,
//             },
//           });
//         }
//         else {
//           console.log('no')
//         }

//       }
//       else if (exam === "Ass - II") {

//         // Update the assignment marks
//         let marks = await prisma.marks.findFirst({
//           where: {
//             studentId: student ? student.id : 0,
//           },
//         });

//         if (marks) {
//           const updateAssignment = await prisma.marks.update({
//             where: {
//               id: marks.id,
//             },
//             data: {
//               ASG2: Number(row.LOT),
//               ASGCO2: Math.round((Number(row.LOT) || 0) * (5 / 3)),
//               ASG2STAFF: staff,
//             },
//           });
//         }
//         else {
//           console.log('no')
//         }

//       }
//       else if (exam === "ESE") {
//         let marks = await prisma.marks.findFirst({
//           where: {
//             studentId: student ? student.id : 0,
//           },
//         });

//         if (marks) {
//           // Marks already exist, update them
//           const updatedMark = await prisma.marks.update({
//             where: { id: marks.id }, // Assuming there's an ID for the existing mark
//             data: {
//               ESELOT: Number(row.LOT),
//               ESEMOT: Number(row.MOT),
//               ESEHOT: Number(row.HOT),
//               ESESTATUS: 'present',
//               ESESTAFF: staff,
//               studentId: student ? student.id : 0,

//             },
//           });
//         }
//         else {
//           console.log('no')
//         }


//       } else {
//         return
//       }

//       console.log('sad')

//     } catch (error) {
//       console.error(error);
//     }

//   }

//   console.log('CSV data uploaded successfully');
//   await prisma.$disconnect();
// }

