import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

//#region Entry reports
async function EntryReport(req: Request, res: Response) {
    const { year, pageNo, search } = req.query;


    try {

        const page = pageNo ? Number(pageNo) : 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        const code = await prisma.code.findMany({
            where: {
                students: {
                    none: {}
                },
                department: {
                    year: Number(year),
                    ...(search ? { departmentCode: search as string } : {})
                }
            },
            include: {
                staff: true,
                department: true
            },
            orderBy: {
                department: {
                    departmentCode: 'asc'
                }
            },
            take: pageSize,
            skip: skip
        })

        const count = await prisma.code.count({
            where: {
                students: {
                    none: {}
                },
                department: {
                    year: Number(year)
                }
            },
        })

        const totalPages = Math.ceil(count / pageSize);

        if (!code.length) {
            return res.status(404).json({
                msg: "No Record found",
            })
        }

        return res.status(200).json({
            data: code,
            totalPages
        });

    } catch (error) {
        res.status(500).json({ msg: 'Internal server error.' });
    }
}
//#endregion

//#region EntryReportBydepartment
async function EntryReportBydepartment(req: Request, res: Response) {
    const { year, search } = req.query;
    if(!year || !search){
        res.status(500).json({ msg: 'year or depcode not found' });
    }

    try {
        const code = await prisma.code.findMany({
            where: {
                students: {
                    none: {}
                },
                department: {
                    year: Number(year),
                    departmentCode: search as string
                }
            },
            include: {
                staff: true,
                department: true
            },
            orderBy: {
                department: {
                    departmentCode: 'asc'
                }
            },
        })

        if (!code.length) {
            return res.status(404).json({
                msg: "No Record found",
            })
        }

        return res.status(200).json({
            data: code,
            totalPage: 0
        });

    } catch (error) {
        res.status(500).json({ msg: 'Internal server error.' });
    }
}
//#endregion

//#region PSO reports
async function PSOReport(req: Request, res: Response) {
    const { year, pageNo, search } = req.query;


    try {

        const page = pageNo ? Number(pageNo) : 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        const code = await prisma.code.findMany({
            where: {
                pso: {
                    none: {}
                },
                department: {
                    year: Number(year),
                    ...(search ? { departmentCode: search as string } : {})
                }
            },
            include: {
                staff: true,
                department:true
            },
            orderBy: {
                department: {
                    departmentCode: 'asc'
                }
            },
            take: pageSize,
            skip: skip
        })

        const count = await prisma.code.count({
            where: {
                pso: {
                    none: {}
                },
                department: {
                    year: Number(year)
                }
            },
        })

        const totalPages = Math.ceil(count / pageSize);

        if (!code.length) {
            return res.status(404).json({
                msg: "No Record found",
            })
        }

        return res.status(200).json({
            data: code,
            totalPages
        });

    } catch (error) {
        res.status(500).json({ msg: 'Internal server error.' });
    }
}
//#endregion

//#region PSOReportBydepartment
async function PSOReportBydepartment(req: Request, res: Response) {
    const { year, search } = req.query;

    try {

        const code = await prisma.code.findMany({
            where: {
                pso: {
                    none: {}
                },
                department: {
                    year: Number(year),
                    ...(search ? { departmentCode: search as string } : {})
                }
            },
            include: {
                staff: true,
                department: true
            },
            orderBy: {
                department: {
                    departmentCode: 'asc'
                }
            },
        })

        if (!code.length) {
            return res.status(404).json({
                msg: "No Record found",
            })
        }

        return res.status(200).json({
            data: code,
            totalPage: 0
        });

    } catch (error) {
        res.status(500).json({ msg: 'Internal server error.' });
    }
}
//#endregion


export { EntryReport, PSOReport, EntryReportBydepartment, PSOReportBydepartment }