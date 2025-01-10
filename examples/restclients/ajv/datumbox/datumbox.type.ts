/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as AdultContentDetectionRequestValidator } from './schemas/adult-content-detection-request.schema.js'
import { validate as CommercialDetectionRequestValidator } from './schemas/commercial-detection-request.schema.js'
import { validate as DocumentSimilarityRequestValidator } from './schemas/document-similarity-request.schema.js'
import { validate as EducationalDetectionRequestValidator } from './schemas/educational-detection-request.schema.js'
import { validate as GenderDetectionRequestValidator } from './schemas/gender-detection-request.schema.js'
import { validate as KeywordExtractionRequestValidator } from './schemas/keyword-extraction-request.schema.js'
import { validate as LanguageDetectionRequestValidator } from './schemas/language-detection-request.schema.js'
import { validate as ReadabilityAssessmentRequestValidator } from './schemas/readability-assessment-request.schema.js'
import { validate as SentimentAnalysisRequestValidator } from './schemas/sentiment-analysis-request.schema.js'
import { validate as SpamDetectionRequestValidator } from './schemas/spam-detection-request.schema.js'
import { validate as SubjectivityAnalysisRequestValidator } from './schemas/subjectivity-analysis-request.schema.js'
import { validate as TextExtractionRequestValidator } from './schemas/text-extraction-request.schema.js'
import { validate as TopicClassificationRequestValidator } from './schemas/topic-classification-request.schema.js'
import { validate as TwitterSentimentAnalysisRequestValidator } from './schemas/twitter-sentiment-analysis-request.schema.js'

export const AdultContentDetectionRequest = {
    validate: AdultContentDetectionRequestValidator as ValidateFunction<AdultContentDetectionRequest>,
    get schema() {
        return AdultContentDetectionRequest.validate.schema
    },
    get errors() {
        return AdultContentDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is AdultContentDetectionRequest => AdultContentDetectionRequest.validate(o) === true,
    parse: (o: unknown): { right: AdultContentDetectionRequest } | { left: DefinedError[] } => {
        if (AdultContentDetectionRequest.is(o)) {
            return { right: o }
        }
        return { left: (AdultContentDetectionRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface AdultContentDetectionRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string | undefined
}

export const CommercialDetectionRequest = {
    validate: CommercialDetectionRequestValidator as ValidateFunction<CommercialDetectionRequest>,
    get schema() {
        return CommercialDetectionRequest.validate.schema
    },
    get errors() {
        return CommercialDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is CommercialDetectionRequest => CommercialDetectionRequest.validate(o) === true,
    parse: (o: unknown): { right: CommercialDetectionRequest } | { left: DefinedError[] } => {
        if (CommercialDetectionRequest.is(o)) {
            return { right: o }
        }
        return { left: (CommercialDetectionRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface CommercialDetectionRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string | undefined
}

export const DocumentSimilarityRequest = {
    validate: DocumentSimilarityRequestValidator as ValidateFunction<DocumentSimilarityRequest>,
    get schema() {
        return DocumentSimilarityRequest.validate.schema
    },
    get errors() {
        return DocumentSimilarityRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is DocumentSimilarityRequest => DocumentSimilarityRequest.validate(o) === true,
    parse: (o: unknown): { right: DocumentSimilarityRequest } | { left: DefinedError[] } => {
        if (DocumentSimilarityRequest.is(o)) {
            return { right: o }
        }
        return { left: (DocumentSimilarityRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface DocumentSimilarityRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The second text. It should not contain HTML tags.
     */
    copy?: string | undefined
    /**
     * The first text. It should not contain HTML tags.
     */
    original?: string | undefined
}

export const EducationalDetectionRequest = {
    validate: EducationalDetectionRequestValidator as ValidateFunction<EducationalDetectionRequest>,
    get schema() {
        return EducationalDetectionRequest.validate.schema
    },
    get errors() {
        return EducationalDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is EducationalDetectionRequest => EducationalDetectionRequest.validate(o) === true,
    parse: (o: unknown): { right: EducationalDetectionRequest } | { left: DefinedError[] } => {
        if (EducationalDetectionRequest.is(o)) {
            return { right: o }
        }
        return { left: (EducationalDetectionRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface EducationalDetectionRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string | undefined
}

export const GenderDetectionRequest = {
    validate: GenderDetectionRequestValidator as ValidateFunction<GenderDetectionRequest>,
    get schema() {
        return GenderDetectionRequest.validate.schema
    },
    get errors() {
        return GenderDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is GenderDetectionRequest => GenderDetectionRequest.validate(o) === true,
    parse: (o: unknown): { right: GenderDetectionRequest } | { left: DefinedError[] } => {
        if (GenderDetectionRequest.is(o)) {
            return { right: o }
        }
        return { left: (GenderDetectionRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface GenderDetectionRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string | undefined
}

export const KeywordExtractionRequest = {
    validate: KeywordExtractionRequestValidator as ValidateFunction<KeywordExtractionRequest>,
    get schema() {
        return KeywordExtractionRequest.validate.schema
    },
    get errors() {
        return KeywordExtractionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is KeywordExtractionRequest => KeywordExtractionRequest.validate(o) === true,
    parse: (o: unknown): { right: KeywordExtractionRequest } | { left: DefinedError[] } => {
        if (KeywordExtractionRequest.is(o)) {
            return { right: o }
        }
        return { left: (KeywordExtractionRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface KeywordExtractionRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The number of keyword combinations (n-grams) that you wish to extract.
     */
    n?: number | undefined
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string | undefined
}

export const LanguageDetectionRequest = {
    validate: LanguageDetectionRequestValidator as ValidateFunction<LanguageDetectionRequest>,
    get schema() {
        return LanguageDetectionRequest.validate.schema
    },
    get errors() {
        return LanguageDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is LanguageDetectionRequest => LanguageDetectionRequest.validate(o) === true,
    parse: (o: unknown): { right: LanguageDetectionRequest } | { left: DefinedError[] } => {
        if (LanguageDetectionRequest.is(o)) {
            return { right: o }
        }
        return { left: (LanguageDetectionRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface LanguageDetectionRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string | undefined
}

export const ReadabilityAssessmentRequest = {
    validate: ReadabilityAssessmentRequestValidator as ValidateFunction<ReadabilityAssessmentRequest>,
    get schema() {
        return ReadabilityAssessmentRequest.validate.schema
    },
    get errors() {
        return ReadabilityAssessmentRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is ReadabilityAssessmentRequest => ReadabilityAssessmentRequest.validate(o) === true,
    parse: (o: unknown): { right: ReadabilityAssessmentRequest } | { left: DefinedError[] } => {
        if (ReadabilityAssessmentRequest.is(o)) {
            return { right: o }
        }
        return { left: (ReadabilityAssessmentRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface ReadabilityAssessmentRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string | undefined
}

export const SentimentAnalysisRequest = {
    validate: SentimentAnalysisRequestValidator as ValidateFunction<SentimentAnalysisRequest>,
    get schema() {
        return SentimentAnalysisRequest.validate.schema
    },
    get errors() {
        return SentimentAnalysisRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is SentimentAnalysisRequest => SentimentAnalysisRequest.validate(o) === true,
    parse: (o: unknown): { right: SentimentAnalysisRequest } | { left: DefinedError[] } => {
        if (SentimentAnalysisRequest.is(o)) {
            return { right: o }
        }
        return { left: (SentimentAnalysisRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface SentimentAnalysisRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string | undefined
}

export const SpamDetectionRequest = {
    validate: SpamDetectionRequestValidator as ValidateFunction<SpamDetectionRequest>,
    get schema() {
        return SpamDetectionRequest.validate.schema
    },
    get errors() {
        return SpamDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is SpamDetectionRequest => SpamDetectionRequest.validate(o) === true,
    parse: (o: unknown): { right: SpamDetectionRequest } | { left: DefinedError[] } => {
        if (SpamDetectionRequest.is(o)) {
            return { right: o }
        }
        return { left: (SpamDetectionRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface SpamDetectionRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string | undefined
}

export const SubjectivityAnalysisRequest = {
    validate: SubjectivityAnalysisRequestValidator as ValidateFunction<SubjectivityAnalysisRequest>,
    get schema() {
        return SubjectivityAnalysisRequest.validate.schema
    },
    get errors() {
        return SubjectivityAnalysisRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is SubjectivityAnalysisRequest => SubjectivityAnalysisRequest.validate(o) === true,
    parse: (o: unknown): { right: SubjectivityAnalysisRequest } | { left: DefinedError[] } => {
        if (SubjectivityAnalysisRequest.is(o)) {
            return { right: o }
        }
        return { left: (SubjectivityAnalysisRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface SubjectivityAnalysisRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string | undefined
}

export const TextExtractionRequest = {
    validate: TextExtractionRequestValidator as ValidateFunction<TextExtractionRequest>,
    get schema() {
        return TextExtractionRequest.validate.schema
    },
    get errors() {
        return TextExtractionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is TextExtractionRequest => TextExtractionRequest.validate(o) === true,
    parse: (o: unknown): { right: TextExtractionRequest } | { left: DefinedError[] } => {
        if (TextExtractionRequest.is(o)) {
            return { right: o }
        }
        return { left: (TextExtractionRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface TextExtractionRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The HTML source of the webpage.
     */
    text?: string | undefined
}

export const TopicClassificationRequest = {
    validate: TopicClassificationRequestValidator as ValidateFunction<TopicClassificationRequest>,
    get schema() {
        return TopicClassificationRequest.validate.schema
    },
    get errors() {
        return TopicClassificationRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is TopicClassificationRequest => TopicClassificationRequest.validate(o) === true,
    parse: (o: unknown): { right: TopicClassificationRequest } | { left: DefinedError[] } => {
        if (TopicClassificationRequest.is(o)) {
            return { right: o }
        }
        return { left: (TopicClassificationRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface TopicClassificationRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string | undefined
}

export const TwitterSentimentAnalysisRequest = {
    validate: TwitterSentimentAnalysisRequestValidator as ValidateFunction<TwitterSentimentAnalysisRequest>,
    get schema() {
        return TwitterSentimentAnalysisRequest.validate.schema
    },
    get errors() {
        return TwitterSentimentAnalysisRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is TwitterSentimentAnalysisRequest => TwitterSentimentAnalysisRequest.validate(o) === true,
    parse: (o: unknown): { right: TwitterSentimentAnalysisRequest } | { left: DefinedError[] } => {
        if (TwitterSentimentAnalysisRequest.is(o)) {
            return { right: o }
        }
        return { left: (TwitterSentimentAnalysisRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface TwitterSentimentAnalysisRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text of the tweet that we evaluate.
     */
    text?: string | undefined
}
