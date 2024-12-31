/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { IncomingHttpHeaders } from 'node:http'
import { got } from 'got'
import type { CancelableRequest, Got, Options, OptionsInit, Response } from 'got'
import type { SafeParseReturnType, ZodError } from 'zod'

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
} from './datumbox.zod.js'

/**
 * api.datumbox.com
 *
 * Datumbox offers a Machine Learning platform composed of 14 classifiers and Natural Language processing functions. Functions include sentiment analysis, topic classification, readability assessment, language detection, and much more.
 */
export class Datumbox {
    public client: Got

    public constructor({
        prefixUrl = 'http://api.datumbox.com/',
        options,
        client = got,
    }: {
        prefixUrl?: string | 'http://api.datumbox.com/'
        options?: Options | OptionsInit
        client?: Got
    } = {}) {
        this.client = client.extend(
            ...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined),
        )
    }

    /**
     * POST /1.0/AdultContentDetection.json
     *
     * Classifies the Document as adult or noadult
     *
     * The Adult Content Detection function classifies the documents as adult or noadult based on their context. It can be used to detect whether a document contains content unsuitable for minors.
     */
    public adultContentDetection({
        body,
    }: { body: AdultContentDetectionRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(AdultContentDetectionRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/AdultContentDetection.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['adultContentDetection']>
    }

    /**
     * POST /1.0/CommercialDetection.json
     *
     * Classifies the Document as commercial or nocommercial
     *
     * The Commercial Detection function labels the documents as commercial or non-commercial based on their keywords and expressions. It can be used to detect whether a website is commercial or not.
     */
    public commercialDetection({
        body,
    }: { body: CommercialDetectionRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(CommercialDetectionRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/CommercialDetection.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['commercialDetection']>
    }

    /**
     * POST /1.0/DocumentSimilarity.json
     *
     * Estimates the similarity between 2 Documents
     *
     * The Document Similarity function estimates the degree of similarity between two documents. It can be used to detect duplicate webpages or detect plagiarism.
     */
    public documentSimilarity({
        body,
    }: { body: DocumentSimilarityRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(DocumentSimilarityRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/DocumentSimilarity.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['documentSimilarity']>
    }

    /**
     * POST /1.0/EducationalDetection.json
     *
     * Classifies the Document as educational or noeducational
     *
     * The Educational Detection function classifies the documents as educational or non-educational based on their context. It can be used to detect whether a website is educational or not.
     */
    public educationalDetection({
        body,
    }: { body: EducationalDetectionRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(EducationalDetectionRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/EducationalDetection.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['educationalDetection']>
    }

    /**
     * POST /1.0/GenderDetection.json
     *
     * Gender Detection Service
     *
     * The Gender Detection function identifies if a particular document is written-by or targets-to a man or a woman based on the context, the words and the idioms found in the text.
     */
    public genderDetection({
        body,
    }: { body: GenderDetectionRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(GenderDetectionRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/GenderDetection.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['genderDetection']>
    }

    /**
     * POST /1.0/KeywordExtraction.json
     *
     * Extracts the Keywords of the Document
     *
     * The Keyword Extraction function enables you to extract from an arbitrary document all the keywords and word-combinations along with their occurrences in the text.
     */
    public keywordExtraction({
        body,
    }: { body: KeywordExtractionRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(KeywordExtractionRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/KeywordExtraction.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['keywordExtraction']>
    }

    /**
     * POST /1.0/LanguageDetection.json
     *
     * Identifies the Language of the Document
     *
     * The Language Detection function identifies the natural language of the given document based on its words and context. This classifier is able to detect 96 different languages.
     */
    public languageDetection({
        body,
    }: { body: LanguageDetectionRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(LanguageDetectionRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/LanguageDetection.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['languageDetection']>
    }

    /**
     * POST /1.0/ReadabilityAssessment.json
     *
     * Evaluates the Readability of the Document
     *
     * The Readability Assessment function determines the degree of readability of a document based on its terms and idioms. The texts are classified as basic, intermediate and advanced depending their difficulty.
     */
    public readabilityAssessment({
        body,
    }: { body: ReadabilityAssessmentRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(ReadabilityAssessmentRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/ReadabilityAssessment.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['readabilityAssessment']>
    }

    /**
     * POST /1.0/SentimentAnalysis.json
     *
     * Identifies the Sentiment of the Document
     *
     * The Sentiment Analysis function classifies documents as positive, negative or neutral (lack of sentiment) depending on whether they express a positive, negative or neutral opinion.
     */
    public sentimentAnalysis({
        body,
    }: { body: SentimentAnalysisRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(SentimentAnalysisRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/SentimentAnalysis.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['sentimentAnalysis']>
    }

    /**
     * POST /1.0/SpamDetection.json
     *
     * Classifies the Document as spam or nospam
     *
     * The Spam Detection function labels documents as spam or nospam by taking into account their context. It can be used to filter out spam emails and comments.
     */
    public spamDetection({
        body,
    }: { body: SpamDetectionRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(SpamDetectionRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/SpamDetection.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['spamDetection']>
    }

    /**
     * POST /1.0/SubjectivityAnalysis.json
     *
     * Classifies Document as Subjective or Objective
     *
     * The Subjectivity Analysis function categorizes documents as subjective or objective based on their writing style. Texts that express personal opinions are labeled as subjective and the others as objective.
     */
    public subjectivityAnalysis({
        body,
    }: { body: SubjectivityAnalysisRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(SubjectivityAnalysisRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/SubjectivityAnalysis.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['subjectivityAnalysis']>
    }

    /**
     * POST /1.0/TextExtraction.json
     *
     * Extracts the clear text from Webpage
     *
     * The Text Extraction function enables you to extract the important information from a given webpage. Extracting the clear text of the documents is an important step before any other analysis.
     */
    public textExtraction({
        body,
    }: { body: TextExtractionRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(TextExtractionRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/TextExtraction.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['textExtraction']>
    }

    /**
     * POST /1.0/TopicClassification.json
     *
     * Identifies the Topic of the Document
     *
     * The Topic Classification function assigns documents in 12 thematic categories based on their keywords, idioms and jargon. It can be used to identify the topic of the texts.
     */
    public topicClassification({
        body,
    }: { body: TopicClassificationRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(TopicClassificationRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/TopicClassification.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['topicClassification']>
    }

    /**
     * POST /1.0/TwitterSentimentAnalysis.json
     *
     * Identifies the Sentiment of Twitter Messages
     *
     * The Twitter Sentiment Analysis function allows you to perform Sentiment Analysis on Twitter. It classifies the tweets as positive, negative or neutral depending on their context.
     */
    public twitterSentimentAnalysis({
        body,
    }: { body: TwitterSentimentAnalysisRequest }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(TwitterSentimentAnalysisRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('1.0/TwitterSentimentAnalysis.json', {
                form: _body.right,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['twitterSentimentAnalysis']>
    }

    public validateRequestBody<Body>(
        parser: { safeParse: (o: unknown) => SafeParseReturnType<unknown, Body> },
        body: unknown,
    ): { right: Body } | FailureResponse<undefined, unknown, 'request:body', undefined> {
        const _body = parser.safeParse(body)
        if (!_body.success) {
            return {
                success: false as const,
                statusCode: undefined,
                status: undefined,
                headers: undefined,
                left: body,
                error: _body.error,
                where: 'request:body',
            } satisfies FailureResponse<undefined, unknown, 'request:body', undefined>
        }
        return { right: _body.data }
    }

    public async awaitResponse<I, S extends Record<PropertyKey, { safeParse: (o: unknown) => SafeParseReturnType<unknown, I> }>>(
        response: CancelableRequest<NoInfer<Response<I>>>,
        schemas: S,
    ) {
        const result = await response
        const status =
            result.statusCode < 200
                ? 'informational'
                : result.statusCode < 300
                  ? 'success'
                  : result.statusCode < 400
                    ? 'redirection'
                    : result.statusCode < 500
                      ? 'client-error'
                      : 'server-error'
        const validator = schemas[result.statusCode] ?? schemas.default
        const body = validator?.safeParse?.(result.body)
        if (result.statusCode < 200 || result.statusCode >= 300) {
            return {
                success: false as const,
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: body?.success ? body.data : result.body,
                error: body !== undefined && !body.success ? body.error : undefined,
                where: 'response:statuscode',
            }
        }
        if (body === undefined || !body.success) {
            return {
                success: body === undefined,
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: result.body,
                error: body?.error,
                where: 'response:body',
            }
        }
        return {
            success: true as const,
            statusCode: result.statusCode.toString(),
            status,
            headers: result.headers,
            right: body.data,
        }
    }
}

export type Status<Major> = Major extends string
    ? Major extends `1${number}`
        ? 'informational'
        : Major extends `2${number}`
          ? 'success'
          : Major extends `3${number}`
            ? 'redirection'
            : Major extends `4${number}`
              ? 'client-error'
              : 'server-error'
    : undefined
export interface SuccessResponse<StatusCode extends string, T> {
    success: true
    statusCode: StatusCode
    status: Status<StatusCode>
    headers: IncomingHttpHeaders
    right: T
}
export interface FailureResponse<StatusCode = string, T = unknown, Where = never, Headers = IncomingHttpHeaders> {
    success: false
    statusCode: StatusCode
    status: Status<StatusCode>
    headers: Headers
    error: ZodError<T> | undefined
    left: T
    where: Where
}
export type StatusCode<Major extends number = 1 | 2 | 3 | 4 | 5> = `${Major}${number}`
