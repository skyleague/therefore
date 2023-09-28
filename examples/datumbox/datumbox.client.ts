/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import got from 'got'
import type { CancelableRequest, Got, Options, OptionsInit, Response } from 'got'
import type { ValidateFunction, ErrorObject } from 'ajv'
import type { IncomingHttpHeaders } from 'http'
import {
    AdultContentDetectionRequest,
    CommercialDetectionRequest,
    DocumentSimilarityRequest,
    EducationalDetectionRequest,
    GenderDetectionRequest,
    KeywordExtractionRequest,
    LanguageDetectionRequest,
    ReadabilityAssessmentRequest,
    SentimentAnalysisRequest,
    SpamDetectionRequest,
    SubjectivityAnalysisRequest,
    TextExtractionRequest,
    TopicClassificationRequest,
    TwitterSentimentAnalysisRequest,
} from './datumbox.type.js'

/**
 * api.datumbox.com
 *
 * Datumbox offers a Machine Learning platform composed of 14 classifiers and Natural Language processing functions. Functions include sentiment analysis, topic classification, readability assessment, language detection, and much more.
 */
export class PetStore {
    public client: Got

    public constructor({
        prefixUrl = 'http://api.datumbox.com/',
        options,
    }: {
        prefixUrl?: string | 'http://api.datumbox.com/'
        options?: Options | OptionsInit
    } = {}) {
        this.client = got.extend(...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined))
    }

    /**
     * Classifies the Document as adult or noadult
     *
     * The Adult Content Detection function classifies the documents as adult or noadult based on their context. It can be used to detect whether a document contains content unsuitable for minors.
     */
    public async adultContentDetection({ body }: { body: AdultContentDetectionRequest }) {
        this.validateRequestBody(AdultContentDetectionRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/AdultContentDetection.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Classifies the Document as commercial or nocommercial
     *
     * The Commercial Detection function labels the documents as commercial or non-commercial based on their keywords and expressions. It can be used to detect whether a website is commercial or not.
     */
    public async commercialDetection({ body }: { body: CommercialDetectionRequest }) {
        this.validateRequestBody(CommercialDetectionRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/CommercialDetection.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Estimates the similarity between 2 Documents
     *
     * The Document Similarity function estimates the degree of similarity between two documents. It can be used to detect duplicate webpages or detect plagiarism.
     */
    public async documentSimilarity({ body }: { body: DocumentSimilarityRequest }) {
        this.validateRequestBody(DocumentSimilarityRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/DocumentSimilarity.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Classifies the Document as educational or noeducational
     *
     * The Educational Detection function classifies the documents as educational or non-educational based on their context. It can be used to detect whether a website is educational or not.
     */
    public async educationalDetection({ body }: { body: EducationalDetectionRequest }) {
        this.validateRequestBody(EducationalDetectionRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/EducationalDetection.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Gender Detection Service
     *
     * The Gender Detection function identifies if a particular document is written-by or targets-to a man or a woman based on the context, the words and the idioms found in the text.
     */
    public async genderDetection({ body }: { body: GenderDetectionRequest }) {
        this.validateRequestBody(GenderDetectionRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/GenderDetection.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Extracts the Keywords of the Document
     *
     * The Keyword Extraction function enables you to extract from an arbitrary document all the keywords and word-combinations along with their occurrences in the text.
     */
    public async keywordExtraction({ body }: { body: KeywordExtractionRequest }) {
        this.validateRequestBody(KeywordExtractionRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/KeywordExtraction.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Identifies the Language of the Document
     *
     * The Language Detection function identifies the natural language of the given document based on its words and context. This classifier is able to detect 96 different languages.
     */
    public async languageDetection({ body }: { body: LanguageDetectionRequest }) {
        this.validateRequestBody(LanguageDetectionRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/LanguageDetection.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Evaluates the Readability of the Document
     *
     * The Readability Assessment function determines the degree of readability of a document based on its terms and idioms. The texts are classified as basic, intermediate and advanced depending their difficulty.
     */
    public async readabilityAssessment({ body }: { body: ReadabilityAssessmentRequest }) {
        this.validateRequestBody(ReadabilityAssessmentRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/ReadabilityAssessment.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Identifies the Sentiment of the Document
     *
     * The Sentiment Analysis function classifies documents as positive, negative or neutral (lack of sentiment) depending on whether they express a positive, negative or neutral opinion.
     */
    public async sentimentAnalysis({ body }: { body: SentimentAnalysisRequest }) {
        this.validateRequestBody(SentimentAnalysisRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/SentimentAnalysis.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Classifies the Document as spam or nospam
     *
     * The Spam Detection function labels documents as spam or nospam by taking into account their context. It can be used to filter out spam emails and comments.
     */
    public async spamDetection({ body }: { body: SpamDetectionRequest }) {
        this.validateRequestBody(SpamDetectionRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/SpamDetection.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Classifies Document as Subjective or Objective
     *
     * The Subjectivity Analysis function categorizes documents as subjective or objective based on their writing style. Texts that express personal opinions are labeled as subjective and the others as objective.
     */
    public async subjectivityAnalysis({ body }: { body: SubjectivityAnalysisRequest }) {
        this.validateRequestBody(SubjectivityAnalysisRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/SubjectivityAnalysis.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Extracts the clear text from Webpage
     *
     * The Text Extraction function enables you to extract the important information from a given webpage. Extracting the clear text of the documents is an important step before any other analysis.
     */
    public async textExtraction({ body }: { body: TextExtractionRequest }) {
        this.validateRequestBody(TextExtractionRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/TextExtraction.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Identifies the Topic of the Document
     *
     * The Topic Classification function assigns documents in 12 thematic categories based on their keywords, idioms and jargon. It can be used to identify the topic of the texts.
     */
    public async topicClassification({ body }: { body: TopicClassificationRequest }) {
        this.validateRequestBody(TopicClassificationRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/TopicClassification.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    /**
     * Identifies the Sentiment of Twitter Messages
     *
     * The Twitter Sentiment Analysis function allows you to perform Sentiment Analysis on Twitter. It classifies the tweets as positive, negative or neutral depending on their context.
     */
    public async twitterSentimentAnalysis({ body }: { body: TwitterSentimentAnalysisRequest }) {
        this.validateRequestBody(TwitterSentimentAnalysisRequest, body)

        return this.awaitResponse(
            this.client.post(`1.0/TwitterSentimentAnalysis.json`, {
                form: body,
            }),
            {
                200: { is: (_x: unknown): _x is string => true },
            }
        )
    }

    public validateRequestBody<T>(schema: { is: (o: unknown) => o is T; assert: (o: unknown) => void }, body: T) {
        schema.assert(body)
        return body
    }

    public async awaitResponse<
        T,
        S extends Record<PropertyKey, undefined | { is: (o: unknown) => o is T; validate?: ValidateFunction<T> }>,
    >(response: CancelableRequest<Response<unknown>>, schemas: S) {
        type FilterStartingWith<S extends PropertyKey, T extends string> = S extends number | string
            ? `${S}` extends `${T}${infer _X}`
                ? S
                : never
            : never
        type InferSchemaType<T> = T extends { is: (o: unknown) => o is infer S } ? S : never
        const result = await response
        const validator = schemas[result.statusCode] ?? schemas.default
        if (validator?.is(result.body) === false || result.statusCode < 200 || result.statusCode >= 300) {
            return {
                statusCode: result.statusCode,
                headers: result.headers,
                left: result.body,
                validationErrors: validator?.validate?.errors ?? undefined,
            } as {
                statusCode: number
                headers: IncomingHttpHeaders
                left: InferSchemaType<S[keyof S]>
                validationErrors?: ErrorObject[]
            }
        }
        return { statusCode: result.statusCode, headers: result.headers, right: result.body } as {
            statusCode: number
            headers: IncomingHttpHeaders
            right: InferSchemaType<S[keyof Pick<S, FilterStartingWith<keyof S, '2' | 'default'>>]>
        }
    }
}
