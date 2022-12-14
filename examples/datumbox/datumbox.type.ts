/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import AjvValidator from 'ajv'
import type { ValidateFunction } from 'ajv'

export interface AdultContentDetectionRequest {
    /**
     * Your API Key
     */
    api_key: string
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string
}

export const AdultContentDetectionRequest = {
    validate: require('./schemas/adult-content-detection-request.schema.js') as ValidateFunction<AdultContentDetectionRequest>,
    get schema() {
        return AdultContentDetectionRequest.validate.schema
    },
    get errors() {
        return AdultContentDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is AdultContentDetectionRequest => AdultContentDetectionRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!AdultContentDetectionRequest.validate(o)) {
            throw new AjvValidator.ValidationError(AdultContentDetectionRequest.errors ?? [])
        }
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
    text?: string
}

export const CommercialDetectionRequest = {
    validate: require('./schemas/commercial-detection-request.schema.js') as ValidateFunction<CommercialDetectionRequest>,
    get schema() {
        return CommercialDetectionRequest.validate.schema
    },
    get errors() {
        return CommercialDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is CommercialDetectionRequest => CommercialDetectionRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!CommercialDetectionRequest.validate(o)) {
            throw new AjvValidator.ValidationError(CommercialDetectionRequest.errors ?? [])
        }
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
    copy?: string
    /**
     * The first text. It should not contain HTML tags.
     */
    original?: string
}

export const DocumentSimilarityRequest = {
    validate: require('./schemas/document-similarity-request.schema.js') as ValidateFunction<DocumentSimilarityRequest>,
    get schema() {
        return DocumentSimilarityRequest.validate.schema
    },
    get errors() {
        return DocumentSimilarityRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is DocumentSimilarityRequest => DocumentSimilarityRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!DocumentSimilarityRequest.validate(o)) {
            throw new AjvValidator.ValidationError(DocumentSimilarityRequest.errors ?? [])
        }
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
    text?: string
}

export const EducationalDetectionRequest = {
    validate: require('./schemas/educational-detection-request.schema.js') as ValidateFunction<EducationalDetectionRequest>,
    get schema() {
        return EducationalDetectionRequest.validate.schema
    },
    get errors() {
        return EducationalDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is EducationalDetectionRequest => EducationalDetectionRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!EducationalDetectionRequest.validate(o)) {
            throw new AjvValidator.ValidationError(EducationalDetectionRequest.errors ?? [])
        }
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
    text?: string
}

export const GenderDetectionRequest = {
    validate: require('./schemas/gender-detection-request.schema.js') as ValidateFunction<GenderDetectionRequest>,
    get schema() {
        return GenderDetectionRequest.validate.schema
    },
    get errors() {
        return GenderDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is GenderDetectionRequest => GenderDetectionRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!GenderDetectionRequest.validate(o)) {
            throw new AjvValidator.ValidationError(GenderDetectionRequest.errors ?? [])
        }
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
    n?: number
    /**
     * The text that you want to analyze. It should not contain HTML tags.
     */
    text?: string
}

export const KeywordExtractionRequest = {
    validate: require('./schemas/keyword-extraction-request.schema.js') as ValidateFunction<KeywordExtractionRequest>,
    get schema() {
        return KeywordExtractionRequest.validate.schema
    },
    get errors() {
        return KeywordExtractionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is KeywordExtractionRequest => KeywordExtractionRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!KeywordExtractionRequest.validate(o)) {
            throw new AjvValidator.ValidationError(KeywordExtractionRequest.errors ?? [])
        }
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
    text?: string
}

export const LanguageDetectionRequest = {
    validate: require('./schemas/language-detection-request.schema.js') as ValidateFunction<LanguageDetectionRequest>,
    get schema() {
        return LanguageDetectionRequest.validate.schema
    },
    get errors() {
        return LanguageDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is LanguageDetectionRequest => LanguageDetectionRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!LanguageDetectionRequest.validate(o)) {
            throw new AjvValidator.ValidationError(LanguageDetectionRequest.errors ?? [])
        }
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
    text?: string
}

export const ReadabilityAssessmentRequest = {
    validate: require('./schemas/readability-assessment-request.schema.js') as ValidateFunction<ReadabilityAssessmentRequest>,
    get schema() {
        return ReadabilityAssessmentRequest.validate.schema
    },
    get errors() {
        return ReadabilityAssessmentRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is ReadabilityAssessmentRequest => ReadabilityAssessmentRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!ReadabilityAssessmentRequest.validate(o)) {
            throw new AjvValidator.ValidationError(ReadabilityAssessmentRequest.errors ?? [])
        }
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
    text?: string
}

export const SentimentAnalysisRequest = {
    validate: require('./schemas/sentiment-analysis-request.schema.js') as ValidateFunction<SentimentAnalysisRequest>,
    get schema() {
        return SentimentAnalysisRequest.validate.schema
    },
    get errors() {
        return SentimentAnalysisRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is SentimentAnalysisRequest => SentimentAnalysisRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!SentimentAnalysisRequest.validate(o)) {
            throw new AjvValidator.ValidationError(SentimentAnalysisRequest.errors ?? [])
        }
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
    text?: string
}

export const SpamDetectionRequest = {
    validate: require('./schemas/spam-detection-request.schema.js') as ValidateFunction<SpamDetectionRequest>,
    get schema() {
        return SpamDetectionRequest.validate.schema
    },
    get errors() {
        return SpamDetectionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is SpamDetectionRequest => SpamDetectionRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!SpamDetectionRequest.validate(o)) {
            throw new AjvValidator.ValidationError(SpamDetectionRequest.errors ?? [])
        }
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
    text?: string
}

export const SubjectivityAnalysisRequest = {
    validate: require('./schemas/subjectivity-analysis-request.schema.js') as ValidateFunction<SubjectivityAnalysisRequest>,
    get schema() {
        return SubjectivityAnalysisRequest.validate.schema
    },
    get errors() {
        return SubjectivityAnalysisRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is SubjectivityAnalysisRequest => SubjectivityAnalysisRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!SubjectivityAnalysisRequest.validate(o)) {
            throw new AjvValidator.ValidationError(SubjectivityAnalysisRequest.errors ?? [])
        }
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
    text?: string
}

export const TextExtractionRequest = {
    validate: require('./schemas/text-extraction-request.schema.js') as ValidateFunction<TextExtractionRequest>,
    get schema() {
        return TextExtractionRequest.validate.schema
    },
    get errors() {
        return TextExtractionRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is TextExtractionRequest => TextExtractionRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!TextExtractionRequest.validate(o)) {
            throw new AjvValidator.ValidationError(TextExtractionRequest.errors ?? [])
        }
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
    text?: string
}

export const TopicClassificationRequest = {
    validate: require('./schemas/topic-classification-request.schema.js') as ValidateFunction<TopicClassificationRequest>,
    get schema() {
        return TopicClassificationRequest.validate.schema
    },
    get errors() {
        return TopicClassificationRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is TopicClassificationRequest => TopicClassificationRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!TopicClassificationRequest.validate(o)) {
            throw new AjvValidator.ValidationError(TopicClassificationRequest.errors ?? [])
        }
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
    text?: string
}

export const TwitterSentimentAnalysisRequest = {
    validate:
        require('./schemas/twitter-sentiment-analysis-request.schema.js') as ValidateFunction<TwitterSentimentAnalysisRequest>,
    get schema() {
        return TwitterSentimentAnalysisRequest.validate.schema
    },
    get errors() {
        return TwitterSentimentAnalysisRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is TwitterSentimentAnalysisRequest => TwitterSentimentAnalysisRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!TwitterSentimentAnalysisRequest.validate(o)) {
            throw new AjvValidator.ValidationError(TwitterSentimentAnalysisRequest.errors ?? [])
        }
    },
} as const
