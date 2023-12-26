import { z } from "zod"

export const cia1Schema = z.object({
    C1STATUS: z.string({required_error: "status of CIA-1 is required", }),
    C1STAFF: z.string({required_error: "Staff initial is required", }),
    C1LOT: z.number({required_error: "C1LOT is required", }),
    C1MOT: z.number({required_error: "C1MOT is required", }),
    C1HOT: z.number({required_error: "C1HOT is required", }),
})

export const cia2Schema = z.object({
    C2STATUS: z.string({required_error: "status of CIA-2 is required", }),
    C2STAFF: z.string({required_error: "Staff initial is required", }),
    C2LOT: z.number({required_error: "C2LOT is required", }),
    C2MOT: z.number({required_error: "C2MOT is required", }),
    C2HOT: z.number({required_error: "C2HOT is required", }),
    
})

export const assignmentSchema = z.object({
    ASG1: z.number({required_error: "ASG-1 mark is required", }).max(3).optional(),
    ASG2: z.number({required_error: "ASG-2 mark is required", }).max(3).optional(),
    ASG1STAFF: z.string({required_error: "ASG-1 Staff is required", }).optional(),
    ASG2STAFF: z.string({required_error: "ASG-2 Staff is required", }).optional()
})

export const ESESchema = z.object({
    ESESTATUS: z.string({required_error: "status of ESE is required", }),
    ESESTAFF: z.string({required_error: "Staff initial is required", }),
    ELOT: z.number({required_error: "ELOT is required", }),
    EMOT: z.number({required_error: "EMOT is required", }),
    EHOT: z.number({required_error: "EHOT is required", }),
})

export const psoSchema = z.object({
    code: z.string({required_error: "course code is required", }),
    PSO1CO1: z.number({required_error: "PSO1CO1 is required", }).max(3),
    PSO1CO2: z.number({required_error: "PSO1CO2 is required", }).max(3),
    PSO1CO3: z.number({required_error: "PSO1CO3 is required", }).max(3),
    PSO1CO4: z.number({required_error: "PSO1CO4 is required", }).max(3),
    PSO1CO5: z.number({required_error: "PSO1CO5 is required", }).max(3),
    PSO2CO1: z.number({required_error: "PSO2CO1 is required", }).max(3),
    PSO2CO2: z.number({required_error: "PSO2CO2 is required", }).max(3),
    PSO2CO3: z.number({required_error: "PSO2CO3 is required", }).max(3),
    PSO2CO4: z.number({required_error: "PSO2CO4 is required", }).max(3),
    PSO2CO5: z.number({required_error: "PSO2CO5 is required", }).max(3),
    PSO3CO1: z.number({required_error: "PSO3CO1 is required", }).max(3),
    PSO3CO2: z.number({required_error: "PSO3CO2 is required", }).max(3),
    PSO3CO3: z.number({required_error: "PSO3CO3 is required", }).max(3),
    PSO3CO4: z.number({required_error: "PSO3CO4 is required", }).max(3),
    PSO3CO5: z.number({required_error: "PSO3CO5 is required", }).max(3),
    PSO4CO1: z.number({required_error: "PSO4CO1 is required", }).max(3),
    PSO4CO2: z.number({required_error: "PSO4CO2 is required", }).max(3),
    PSO4CO3: z.number({required_error: "PSO4CO3 is required", }).max(3),
    PSO4CO4: z.number({required_error: "PSO4CO4 is required", }).max(3),
    PSO4CO5: z.number({required_error: "PSO4CO5 is required", }).max(3),
    PSO5CO1: z.number({required_error: "PSO5CO1 is required", }).max(3),
    PSO5CO2: z.number({required_error: "PSO5CO2 is required", }).max(3),
    PSO5CO3: z.number({required_error: "PSO5CO3 is required", }).max(3),
    PSO5CO4: z.number({required_error: "PSO5CO4 is required", }).max(3),
    PSO5CO5: z.number({required_error: "PSO5CO5 is required", }).max(3),
})

export type cia1Data = z.infer<typeof cia1Schema>
export type cia2Data = z.infer<typeof cia2Schema>
export type assignmentData = z.infer<typeof assignmentSchema>
export type ESEData = z.infer<typeof ESESchema>
export type psoData = z.infer<typeof psoSchema>