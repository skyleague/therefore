/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
/* eslint-disable */

import { z } from 'zod'

export const File = z
    .object({
        id: z.number().int().describe('Unique identifier for the file.').optional(),
        size: z.string().describe('The size of the file in bytes.').optional(),
        url: z.string().describe('The TechPort URL at which the file is accessible for download.').optional(),
    })
    .describe('Represents a file associated with a library item.')

export type File = z.infer<typeof File>

export const WorkLocation = z.string().describe('A state/territory where work on this project is performed.')

export type WorkLocation = z.infer<typeof WorkLocation>

export const ProjectManager = z.string().describe('The name of a Project Manager responsible for management of an project.')

export type ProjectManager = z.infer<typeof ProjectManager>

export const ProgramManager = z.string().describe('The name of a Program Manager responsible for management of an project.')

export type ProgramManager = z.infer<typeof ProgramManager>

export const ProgramDirector = z.string().describe('The name of a Program Director responsible for management of an project.')

export type ProgramDirector = z.infer<typeof ProgramDirector>

export const PrincipalInvestigator = z
    .string()
    .describe('The name of the Principal Investigator who is a lead scientist or engineer for an project.')

export type PrincipalInvestigator = z.infer<typeof PrincipalInvestigator>

export const LibraryItem = z
    .object({
        completionDate: z.string().describe('Date the library item was completed.').optional(),
        description: z.string().describe('Description of the library item.').optional(),
        externalUrl: z.string().describe('External URL for the library item.').optional(),
        files: File.array().describe('List of files associated with the library item.').optional(),
        id: z.number().int().describe('Unique identifier for the library item.').optional(),
        publishedBy: z.string().describe('Publisher of the library item.').optional(),
        publishedDate: z.string().describe('Date the library item was published.').optional(),
        title: z.string().describe('Title of the library item').optional(),
        type: z.string().describe('Identifies the type of library item, e.g. Image').optional(),
    })
    .describe('Represents a specific library item that is part of this project.')

export type LibraryItem = z.infer<typeof LibraryItem>

export const Destination = z
    .string()
    .describe('Represents a destination towards which the technology on this project helps advance the Agency goals.')

export type Destination = z.infer<typeof Destination>

export const CoInvestigator = z.string().describe('The name of an investigator who is a scientist or engineer for an project.')

export type CoInvestigator = z.infer<typeof CoInvestigator>

export const Organization = z
    .object({
        acronym: z.string().describe('The acronym of the organization.').optional(),
        city: z.string().describe('The city in which the organization is located.').optional(),
        name: z.string().describe('The name of the organization.').optional(),
        state: z.string().describe('The state in which the organization is located.').optional(),
    })
    .describe('A NASA center/facility associated with an project.')

export type Organization = z.infer<typeof Organization>

export const CloseoutDocument = z
    .string()
    .describe('Represents a file hyperlink or external hyperlink to a project closeout final report artifact.')

export type CloseoutDocument = z.infer<typeof CloseoutDocument>

export const TechnologyArea = z
    .object({
        code: z.string().describe('The code identifier for the Technology Area.').optional(),
        id: z.number().int().describe('Unique identifier for the Technology Area.').optional(),
        name: z.string().describe('The name of the Technology Area.').optional(),
    })
    .describe('The Technology Area for a given technology that corresponds to the NASA Technology Roadmap.')

export type TechnologyArea = z.infer<typeof TechnologyArea>

export const GetApiByResponse200 = z.object({
    id: z.number().int().optional(),
    lastUpdated: z.string().optional(),
})

export type GetApiByResponse200 = z.infer<typeof GetApiByResponse200>

export const Project = z
    .object({
        acronym: z.string().describe('Abbreviated name of the project.').optional(),
        additionalTas: TechnologyArea.array()
            .describe('List of additional and cross-cutting technology areas associated with the project.')
            .optional(),
        benefits: z
            .string()
            .describe(
                'Describes the benefits offered to NASA funded and planned missions, unfunded or planned missions, commercial space industry, and to the nation.',
            )
            .optional(),
        closeoutDocuments: CloseoutDocument.array()
            .describe('List of document files or links to the project final report closeout documentation.')
            .optional(),
        closeoutSummary: z.string().describe('The project closeout summary excerpt.').optional(),
        coFundingPartners: Organization.array()
            .describe(
                'Other government agencies, NASA Mission Directoratres, universities, or commercial entities performing contributing resources to this project.',
            )
            .optional(),
        coInvestigators: CoInvestigator.array()
            .describe('Names of the additional investigators who are scientists or engineers for this project.')
            .optional(),
        description: z.string().describe('A detailed description of the project.').optional(),
        destinations: Destination.array()
            .describe('List of the NASA destinations the technology on this project helps achieve.')
            .optional(),
        endDate: z.string().describe('The month and year the project is expected to complete its work.').optional(),
        id: z.number().int().describe('Unique identifier for the project.').optional(),
        lastUpdated: z
            .string()
            .date()
            .describe('ISO 8601 full-date in the format YYYY-MM-DD describing the last time this project was updated.')
            .optional(),
        leadOrganization: Organization.optional(),
        libraryItems: LibraryItem.array().describe('List of library items in the project library.').optional(),
        primaryTas: TechnologyArea.array()
            .describe('List of primary technolgy areas (from the NASA Technology Roadmap) associated with the project.')
            .optional(),
        principalInvestigators: PrincipalInvestigator.array()
            .describe('Names of the Principal Investigators who are the lead scientists or engineers for this project.')
            .optional(),
        programDirectors: ProgramDirector.array()
            .describe('Names of the Program Directors responsible for the management of this project.')
            .optional(),
        programManagers: ProgramManager.array()
            .describe('Names of the Program Managers responsible for the management of this project.')
            .optional(),
        projectManagers: ProjectManager.array()
            .describe('Names of the Project Managers responsible for the management of this project.')
            .optional(),
        responsibleMissionDirectorateOrOffice: z
            .string()
            .describe('The NASA Mission Directorate or Office that is the primary funding source for this project.')
            .optional(),
        responsibleProgram: z
            .string()
            .describe('The NASA program that is the primary funding source for this project.')
            .optional(),
        startDate: z.string().describe('The month and year the project was authorized to proceed.').optional(),
        status: z.string().describe('Indicates whether the project is currently active, completed, or canceled.').optional(),
        supportedMissionType: z
            .string()
            .describe('The supported mission type (Projected Mission, Planned Mission, or Pull).')
            .optional(),
        supportingOrganizations: Organization.array()
            .describe('The supporting organizations for this project that are conducting work on the project.')
            .optional(),
        technologyMaturityCurrent: z
            .string()
            .describe('The current technology maturity (technology readiness level) of the project.')
            .optional(),
        technologyMaturityEnd: z
            .string()
            .describe('The estimated technology maturity (technology readiness level) of the project at its end.')
            .optional(),
        technologyMaturityStart: z
            .string()
            .describe('The technology maturity (technology readiness level) of the project at its beginning.')
            .optional(),
        title: z.string().describe('Title of the project.').optional(),
        website: z.string().describe('The URL for the associated website.').optional(),
        workLocations: WorkLocation.array()
            .describe('States and territories with people performing work on this project.')
            .optional(),
    })
    .describe('Top-level TechPort object representing a NASA technology project and its associated data.')

export type Project = z.infer<typeof Project>
