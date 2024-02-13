import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { fromZodError } from "zod-validation-error"
import { psoSchema } from '../model/result';
import { CourseOutCome, DepartmentOutcome, EachStudentOutcome, ProgramOutcome, StudentOutcome } from './Outcome/outcomes';
import { addNewCourse, deleteCourse, excelCourse, getAllCourses } from './Course/course';
import { upload } from './common';
import { addMark, deleteMark, excelMarks, getMarkByCode } from './marks/marks';
import { addNewDepartment, deleteDepartment, excelDepartment, getAllDepartment } from './department/department';
import { addStaff, addStaffCourse, deleteStaff, deleteStaffCourse, excelStaff, getAllStaff, getByCourseStaffTaken, getStaff, getStaffbyCode, searchCourse } from './Staff/staff';
import { EntryReport, EntryReportBydepartment, PSOReport, PSOReportBydepartment } from './reports/reports';
import { Dahsbaord } from './Dashboard/Dashboard';

const prisma = new PrismaClient();
export const userRouter = express.Router();

//Dahsbaord
userRouter.put("/dashboard", Dahsbaord)

//marks
userRouter.post("/addMarks", addMark);
userRouter.post('/addMarksByExcel', upload.single('Excel'), excelMarks)
userRouter.get("/getMarkByCode", getMarkByCode);
userRouter.put("/deleteMark", deleteMark)
//outcomes
userRouter.put("/getStudent", StudentOutcome);
userRouter.get("/EachStudentOutcome", EachStudentOutcome);
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
userRouter.post('/addDepartmentByExcel', upload.single('Excel'), excelDepartment)
//staff
userRouter.get("/getStaffsDetails", getByCourseStaffTaken)
userRouter.get("/getStaffbyCode", getStaffbyCode)
userRouter.get("/getAllStaff", getAllStaff)
userRouter.get("/getStaff", getStaff)
userRouter.post('/addStaff', addStaff)
userRouter.post('/staffCourseAssign', addStaffCourse)
userRouter.delete("/deleteStaff", deleteStaff)
userRouter.delete("/deleteStaffCourse", deleteStaffCourse)
userRouter.get("/searchCourse", searchCourse);
userRouter.post('/addStaffByExcel', upload.single('Excel'), excelStaff)
//others
userRouter.post("/addPso", addPso);
userRouter.get("/searchDepartment", searchDepartment);
userRouter.put("/byCode", getMarksWithCode);
userRouter.get("/searchCode", getCode);
userRouter.get("/getYear", getYear);
userRouter.post("/setYear", setYear);
//reports
userRouter.get('/EntryReport',EntryReport);
userRouter.get('/EntryReportBydepartment',EntryReportBydepartment);
userRouter.get('/PSOReport',PSOReport);
userRouter.get('/PSOReportBydepartment',PSOReportBydepartment);

//#region getYear
async function getYear(req: Request, res: Response) {

  try {
      const getYear = await prisma.date.findFirst();

      return res.status(200).json({
        data: getYear?.date,
      });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Internal server error",
      
    });
  }
}
//#endregion

//#region setYear
async function setYear(req: Request, res: Response) {


  try {

    const {year} = req.query

      const getYear = await prisma.date.update({
        where:{
          id:1
        },
        data:{
          date:Number(year)
        }
      });

      return res.status(200).json({
        success: 'updated',
      });
      
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Internal server error",
      
    });
  }
}
//#endregion


//automate
// userRouter.put("/addMarksAutomates", addMarksAutomate)
// userRouter.put("/addDep", addDep)
// userRouter.put("/addCourse", addCourseAutomate)
// userRouter.get("/getadd", uploadCSV)



//#region addPso
async function addPso(req: Request, res: Response) {



  try {

    const data = psoSchema.safeParse(req.body);

    if (!data.success) {
      let errMessage = fromZodError(data.error).message;
      return res.status(400).json({
        msg: errMessage,
        
      });
    }

    const resultData = data.data;

    if (!resultData) {
      return res.status(409).json({
        msg: "Invalid params",
        
      });
    }

    const existingCode = await prisma.code.findFirst({
      where: {
        code: resultData.code,
        department:{
          year:Number(req.body.year)
        }
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

      return res.status(200).json({
        success: "PSO added successfully",
      });
    } else {
      return res.status(404).json({
        msg: "Course code does not exist",
        
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Internal server error",
      
    });
  }
}
//#endregion

//#region searchDepartment
async function searchDepartment(req: Request, res: Response) {


  try {

    const { question } = req.query;
    const {year}=req.query

    if (question) {
      const departments = await prisma.department.findMany({
        where: {
          departmentCode: {
            contains: question as string,
          },
          year:Number(year)
        },
      });
      return res.status(200).json({
        data: departments,
      });
    }
  } catch (error) {
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
}
//#endregion

//#region getCode
async function getCode(req: Request, res: Response) {
  

  try {

    const { question,year,sem } = req.query;

    if (question && year && sem) {

      const Courses = await prisma.code.findMany({
        where: {
          department:{
            departmentCode:question as string,
            year:Number(year)
          } ,
          semester:sem as string
        },
      });

      return res.status(200).json({
        data: Courses,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Internal server error",
      
    });
  }
}
//#endregion

//#region get marks by code
async function getMarksWithCode(req: Request, res: Response) {
  try {
    const { department, code, regNo,year,sem } = req.body;

    if (!department || !code || !regNo|| !year ||! sem) {
      return res.status(400).json({
        msg: "Missing required parameters: department, code,year or regNo",
      });
    }

    const marks = await prisma.marks.findMany({
      where: {
        student: {
          regNo: regNo as string,
          code: {
            department: {
              departmentCode: department as string,
              year:{
                equals:year
              }
            },
            code: code as string,
            semester:sem as string
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
      msg: "Internal server error",
    });
  }
}

//#endregion

