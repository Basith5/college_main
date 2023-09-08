import express, { Request, Response, response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { fromZodError } from "zod-validation-error"
import { ESEData, ESESchema, assignmentData, assignmentSchema, cia1Data, cia1Schema, cia2Data, cia2Schema } from '../model/result';
import { object } from 'zod';

const prisma = new PrismaClient();


export const userRouter = express.Router();

userRouter.post("/addMarks", addMark);

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
        return res.status(409).json({
          error: {
            message: "CIA-1 marks already exist for this student",
          },
        });
      }

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
          STAFF:  resultData.staff,
          studentId: student ? student.id : 0,

          C2Q1: 0,
          C2Q2: 0,
          C2Q3: 0,
          C2Q4: 0,
          C2Q5: 0,
          C2Q6: 0,
          C2Q7: 0,
          C2Q8: 0,
          C2Q9: 0,
          C2Q10: 0,
          C2Q11: 0,
          C2Q12: 0,
          C2Q13: 0,
          C2Q14: 0,
          C2Q15: 0,
          C2Q16: 0,
          C2Q17: 0,
          C2Q18: 0,
          C2Q19: 0,
          C2Q20: 0,
          C2Q21: 0,
          C2Q22: 0,
          C2Q23: 0,
          C2Q24: 0,
          C2Q25: 0,
          C2Q26: 0,
          C2Q27: 0,
          C2Q28: 0,

          ESEQ1: 0,
          ESEQ2: 0,
          ESEQ3: 0,
          ESEQ4: 0,
          ESEQ5: 0,
          ESEQ6: 0,
          ESEQ7: 0,
          ESEQ8: 0,
          ESEQ9: 0,
          ESEQ10: 0,
          ESEQ11: 0,
          ESEQ12: 0,
          ESEQ13: 0,
          ESEQ14: 0,
          ESEQ15: 0,
          ESEQ16: 0,
          ESEQ17: 0,
          ESEQ18: 0,
          ESEQ19: 0,
          ESEQ20: 0,
          ESEQ21: 0,
          ESEQ22: 0,
          ESEQ23: 0,
          ESEQ24: 0,
          ESEQ25: 0,
          ESEQ26: 0,
          ESEQ27: 0,
          ESEQ28: 0,

          ASG1: 0,
          ASG2: 0,
        },
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
        },
      });
    
      return res.json({
        success: "CIA-2 is added successfully"
      });
    }
    
    
     else if (exam == "ASG"){

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

      ///update querry error and simultaneouse update of assigmnet marks??????????????????

      const updateAssignment = await prisma.marks.update({
        where: {
          id: existingCIA1Marks.id,
        },
        data: {
          ASG1: resultData.ASG1,
          ASG2: resultData.ASG2,
          ASGCO1: (resultData.ASG1 || 0) * (5/3),
          ASGCO2: (resultData.ASG2 || 0) * (5/3),
        }
      })

      return res.json({
        success: "ASSIGMENT MARK is added successfully"
      });

    } else if (exam == "ESE") {

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

