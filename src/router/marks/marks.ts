
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { fromZodError } from "zod-validation-error"
import { ESEData, ESESchema, assignmentData, assignmentSchema, cia1Data, cia1Schema, cia2Data, cia2Schema } from '../../model/result';
import { getFilePath } from '../common';
import * as fs from 'fs';
import csv from 'csv-parser';

const prisma = new PrismaClient();



//#region addMarks
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
                    ESELOT: resultData.ESELOT,
                    ESEMOT: resultData.ESEMOT,
                    ESEHOT: resultData.ESEHOT,
                    ESESTATUS: resultData.ESESTATUS,
                    ESESTAFF: resultData.ESESTAFF,    //ESE -2 staff initiall

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
            (mark.C2LOT === null && mark.ESELOT === null) ||
            (mark.ESELOT === null && mark.C1LOT === null)
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
            updateFields[`ESELOT`] = null;
            updateFields[`ESEMOT`] = null;
            updateFields[`ESEHOT`] = null;

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

async function excelMarksInsert(row: {RegNo: string, Exam: string; LOT: string; MOT: string; HOT: string; },  courseCode: string, depCode: string) {
    let exam: string = row.Exam;
    const code = courseCode;
    const department = depCode;
    const claass = depCode;
    const section = 'A';
    const staff = 'Jmc Admin';
    let Markdata: { LOT: any; MOT: any; HOT: any; STATUS: any; STAFF: any; }

    try {
        let regNo = row.RegNo

        const check = await prisma.code.findFirst({
            where: {
                depCode: department,
                code: code,
            },
        });

        if (!check) {
            return
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
        }


        // Now, create the marks
        if (exam === "CIA - I") {

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
                        C1LOT: Number(row.LOT),
                        C1MOT: Number(row.MOT),
                        C1HOT: Number(row.HOT),
                        C1STATUS: 'present',
                        C1STAFF: staff,
                        studentId: student ? student.id : 0,
                    },
                });

                return
            }

            // If marks do not exist, create them
            const mark = await prisma.marks.create({
                data: {
                    C1LOT: Number(row.LOT),
                    C1MOT: Number(row.MOT),
                    C1HOT: Number(row.HOT),
                    C1STATUS: 'present',
                    C1STAFF: staff,
                    studentId: student ? student.id : 0,

                },
            });


        }
        else if (exam === "CIA - II") {
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
                        C2LOT: Number(row.LOT),
                        C2MOT: Number(row.MOT),
                        C2HOT: Number(row.HOT),
                        C2STATUS: 'present',
                        C2STAFF: staff,
                        studentId: student ? student.id : 0,

                    },
                });

            }
            else {

            }
        }
        else if (exam === "Ass - I") {

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
                        ASG1: Number(row.LOT),
                        ASGCO1: Math.round((Number(row.LOT) || 0) * (5 / 3)),
                        ASG1STAFF: staff,
                    },
                });
            }
            else {
                console.log('no')
            }

        }
        else if (exam === "Ass - II") {

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
                        ASG2: Number(row.LOT),
                        ASGCO2: Math.round((Number(row.LOT) || 0) * (5 / 3)),
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
                        ESELOT: Number(row.LOT) || null ,
                        ESEMOT: Number(row.MOT) || null,
                        ESEHOT: Number(row.HOT) || null,
                        ESESTATUS: 'present',
                        ESESTAFF: staff,
                        studentId: student ? student.id : 0,

                    },
                });
            }
            else {
                console.log('no')
            }


        } else {
            console.log(exam)
            return
        }



    } catch (error) {
        console.error(error);
    }


}

//#region excelMarks
async function excelMarks(req: Request, res: Response) {
    const files = req.file as Express.Multer.File;
    const { courseCode } = req.body;
    const { depCode } = req.body;

    if (!courseCode || !depCode) {
        return res.status(500).json({
            success: 'please fill all details'
        });
    }

    const dest = await getFilePath(files);
    if (!dest) {
        return res.status(500).json({
            success: 'Failed with file name'
        });
    }

    if (!files) {
        return res.status(500).json({
            success: 'please upload file'
        });
    }

    let rowCount = 0;
    let temp = ''
    let totalStudent = 1

    let tempdata: { RegNo: string, Exam: string, LOT: string, MOT: string, HOT: string }[] = [];
   
    fs.createReadStream(dest)
        .pipe(csv())
        .on('data', async (row) => {
            if ('Register Number' in row) {
                // console.log(row['Register Number'])
                if (rowCount < 1) {
                    temp = row['Register Number']
                }
                tempdata.push({
                    RegNo: temp,
                    Exam: row.Exam,
                    LOT: row.LOT,
                    MOT: row.MOT,
                    HOT: row.HOT
                })
                if (rowCount > 4) {
                    rowCount = 0
                    totalStudent = totalStudent + 1
                }
                else {
                    rowCount = rowCount + 1
                }

            }
        })
        .on('end',async () => {
            for (let i = 0; i < tempdata.length; i++) {
                if (tempdata[i]['RegNo'] !== '') {
                    await  excelMarksInsert(tempdata[i],courseCode,depCode)
                }
                else {
                    break;
                }
            }

            console.log('CSV file successfully processed');


        });

    return res.status(200).json({
        success: 'Course Updated' + dest
    });

}
//#endregion

export { addMark, getMarkByCode, excelMarks, deleteMark }
