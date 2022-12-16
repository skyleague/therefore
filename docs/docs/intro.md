---
sidebar_position: 00
title: Overview
slug: /
---

# Introduction

> Such is the advantage of a well-constructed language that its simplified notation often becomes the source of profound theories.
>
> -   Pierre-Simon de Laplace

Therefore empowers you to generate JSON Schemas and typescript types.

It is hard to keep JSON Schemas and types aligned, _especially_ in a world of growing api complexity. Therefore, we want to simplify the most frustrating problems associated with JSON validation and typing.

## JSON Schema

JSON Schema is a powerful tool for defining and validating the structure and content of JSON data. It allows developers to describe the expected format and constraints of data in a standardized way, enabling automatic validation and facilitating integration between different systems. The adoption of JSON Schema has grown significantly in recent years, and many programming languages now offer stable implementations of JSON Schema validators.

However, one potential challenge with using JSON Schema with TypeScript is maintaining synchronization between your schemas and code. Without proper tooling, this can be difficult and time-consuming. Additionally, JSON Schema is verbose and can be difficult to read, compared to simply looking at a TypeScript definition.

## Validation

This is where Therefore comes in. Unlike other tools, Therefore does not perform any validation itself. Instead, it provides a simple and intuitive way to create concise JSON Schemas with powerful tooling to support you in various tasks. Need to reference another variable in your schema? Simply use Therefore's built-in functionality. Want to exclude a specific object from being exported? No problem, Therefore makes it easy. And if you want to reuse your JSON Schema in an OpenAPI specification, you can do that with Therefore as well.

## Definition

One of the key features of Therefore is its ability to generate JSON Schemas from TypeScript code. This means that you can use your existing TypeScript definitions to automatically create JSON Schemas, saving you the time and effort of writing the schemas manually. Furthermore, Therefore's intelligent synchronization feature ensures that your JSON Schemas are always up-to-date with your code, so you don't have to worry about maintaining consistency between the two. This makes it easy to use JSON Schema with TypeScript, even for large and complex projects.

Overall, Therefore provides a simple and intuitive way to use JSON Schema with TypeScript, making it an attractive option for developers working on projects that require JSON Schema. Try it out today and see how it can help you in your projects!

## Security

Therefore internally uses [`Ajv`](https://github.com/ajv-validator/ajv) for its validation. That means that the security considerations of using Therefore become a superset of those of [`Ajv`](https://github.com/ajv-validator/ajv#security-considerations). By default Therefore tries to implement the strictest interface and validation given a schema. Explicitly, Therefore does not know about validation - it is just an easy interface to generate schemas.
