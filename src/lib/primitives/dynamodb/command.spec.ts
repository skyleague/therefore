import { describe, expect, it } from 'vitest'
import { Pet } from '../../../../examples/restclients/petstore/petstore.type.js'
import { $ref } from '../ref/ref.js'
import { conditionExpression } from './expressions/condition.js'
import { updateExpression } from './expressions/update.js'

describe('getItem', () => {
    it('should format the key', () => {
        expect(true).toBe(true)
    })
})

describe('query', () => {
    it('should build a condition expression', () => {
        expect(
            conditionExpression($ref(Pet), (existing, input) => {
                return {
                    and: [
                        existing.name.eq(input.name),
                        existing.category.eq(input.category!),
                        {
                            or: [existing.status.eq(input.status!), existing.name.eq(input.name!)],
                        },
                    ],
                }
            }),
        ).toMatchInlineSnapshot(`
          {
            "attributeNames": {
              "name": "#name",
              "status": "#status",
            },
            "attributeValues": {
              "category": ":category",
              "name": ":name",
              "status": ":status",
            },
            "expression": "#name = :name AND category = :category AND (#status = :status OR #name = :name)",
            "inputSchema": {
              "category": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "_children": [
                  JSONObjectType {
                    "_attributes": {
                      "generic": {},
                      "typescript": {},
                    },
                    "_children": [
                      NodeTrait {
                        "_attributes": {
                          "generic": {},
                          "typescript": {},
                        },
                        "_children": [
                          IntegerType {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_definition": {},
                            "_id": "14",
                            "_isCommutative": true,
                            "_name": "Category",
                            "_options": {
                              "maxInclusive": true,
                              "minInclusive": true,
                            },
                            "_type": "integer",
                          },
                        ],
                        "_definition": {},
                        "_id": "16",
                        "_isCommutative": true,
                        "_type": "optional",
                      },
                      NodeTrait {
                        "_attributes": {
                          "generic": {},
                          "typescript": {},
                        },
                        "_children": [
                          StringType {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_definition": {},
                            "_id": "15",
                            "_isCommutative": true,
                            "_name": "Category",
                            "_options": {},
                            "_type": "string",
                          },
                        ],
                        "_definition": {},
                        "_id": "17",
                        "_isCommutative": true,
                        "_type": "optional",
                      },
                    ],
                    "_definition": {},
                    "_id": "18",
                    "_isCommutative": false,
                    "_name": "Category",
                    "_options": {
                      "strict": false,
                    },
                    "_type": "object",
                    "shape": {
                      "id": NodeTrait {
                        "_attributes": {
                          "generic": {},
                          "typescript": {},
                        },
                        "_children": [
                          IntegerType {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_definition": {},
                            "_id": "14",
                            "_isCommutative": true,
                            "_name": "Category",
                            "_options": {
                              "maxInclusive": true,
                              "minInclusive": true,
                            },
                            "_type": "integer",
                          },
                        ],
                        "_definition": {},
                        "_id": "16",
                        "_isCommutative": true,
                        "_type": "optional",
                      },
                      "name": NodeTrait {
                        "_attributes": {
                          "generic": {},
                          "typescript": {},
                        },
                        "_children": [
                          StringType {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_definition": {},
                            "_id": "15",
                            "_isCommutative": true,
                            "_name": "Category",
                            "_options": {},
                            "_type": "string",
                          },
                        ],
                        "_definition": {},
                        "_id": "17",
                        "_isCommutative": true,
                        "_type": "optional",
                      },
                    },
                  },
                ],
                "_definition": {},
                "_hooks": {
                  "onGenerate": [
                    [Function],
                  ],
                  "onLoad": [
                    [Function],
                  ],
                },
                "_id": "1",
                "_isCommutative": true,
                "_name": "category",
                "_options": {},
                "_type": "ref",
              },
              "name": StringType {
                "_attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "_definition": {},
                "_id": "3",
                "_isCommutative": true,
                "_name": "name",
                "_options": {},
                "_type": "string",
              },
              "status": EnumType {
                "_attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "_definition": {
                  "description": "pet status in the store",
                },
                "_id": "6",
                "_isCommutative": true,
                "_isNamed": false,
                "_name": "status",
                "_options": {},
                "_type": "enum",
                "enum": [
                  "available",
                  "pending",
                  "sold",
                ],
              },
            },
          }
        `)
    })
})

describe('update', () => {
    it('should build an update expression', () => {
        expect(
            updateExpression({
                shape: $ref(Pet),
                build: (existing, input) => {
                    return [
                        //
                        existing.name.set(input.name!),
                        existing.tags.listAppend(input.tags!),
                        existing.photoUrls.remove(),
                    ]
                },
            }),
        ).toMatchInlineSnapshot(`
          {
            "attributeConstValues": {},
            "attributeNames": {
              "name": "#name",
            },
            "attributeValues": {
              "name": ":name",
              "tags": ":tags",
            },
            "expression": "SET #name = :name, tags = list_append(tags, :tags) REMOVE photoUrls",
            "inputSchema": {
              "name": StringType {
                "_attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "_definition": {},
                "_id": "3",
                "_isCommutative": true,
                "_name": "name",
                "_options": {},
                "_type": "string",
              },
              "tags": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "typescript": {},
                    },
                    "_children": [
                      JSONObjectType {
                        "_attributes": {
                          "generic": {},
                          "typescript": {},
                        },
                        "_children": [
                          NodeTrait {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_children": [
                              IntegerType {
                                "_attributes": {
                                  "generic": {},
                                  "typescript": {},
                                },
                                "_definition": {},
                                "_id": "19",
                                "_isCommutative": true,
                                "_name": "Tag",
                                "_options": {
                                  "maxInclusive": true,
                                  "minInclusive": true,
                                },
                                "_type": "integer",
                              },
                            ],
                            "_definition": {},
                            "_id": "21",
                            "_isCommutative": true,
                            "_type": "optional",
                          },
                          NodeTrait {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_children": [
                              StringType {
                                "_attributes": {
                                  "generic": {},
                                  "typescript": {},
                                },
                                "_definition": {},
                                "_id": "20",
                                "_isCommutative": true,
                                "_name": "Tag",
                                "_options": {},
                                "_type": "string",
                              },
                            ],
                            "_definition": {},
                            "_id": "22",
                            "_isCommutative": true,
                            "_type": "optional",
                          },
                        ],
                        "_definition": {},
                        "_id": "23",
                        "_isCommutative": false,
                        "_name": "Tag",
                        "_options": {
                          "strict": false,
                        },
                        "_type": "object",
                        "shape": {
                          "id": NodeTrait {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_children": [
                              IntegerType {
                                "_attributes": {
                                  "generic": {},
                                  "typescript": {},
                                },
                                "_definition": {},
                                "_id": "19",
                                "_isCommutative": true,
                                "_name": "Tag",
                                "_options": {
                                  "maxInclusive": true,
                                  "minInclusive": true,
                                },
                                "_type": "integer",
                              },
                            ],
                            "_definition": {},
                            "_id": "21",
                            "_isCommutative": true,
                            "_type": "optional",
                          },
                          "name": NodeTrait {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_children": [
                              StringType {
                                "_attributes": {
                                  "generic": {},
                                  "typescript": {},
                                },
                                "_definition": {},
                                "_id": "20",
                                "_isCommutative": true,
                                "_name": "Tag",
                                "_options": {},
                                "_type": "string",
                              },
                            ],
                            "_definition": {},
                            "_id": "22",
                            "_isCommutative": true,
                            "_type": "optional",
                          },
                        },
                      },
                    ],
                    "_definition": {},
                    "_hooks": {
                      "onGenerate": [
                        [Function],
                      ],
                      "onLoad": [
                        [Function],
                      ],
                    },
                    "_id": "7",
                    "_isCommutative": true,
                    "_name": "tags",
                    "_options": {},
                    "_type": "ref",
                  },
                ],
                "_definition": {},
                "_id": "8",
                "_isCommutative": false,
                "_name": "tags",
                "_options": {},
                "_type": "array",
                "element": NodeTrait {
                  "_attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "_children": [
                    JSONObjectType {
                      "_attributes": {
                        "generic": {},
                        "typescript": {},
                      },
                      "_children": [
                        NodeTrait {
                          "_attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "_children": [
                            IntegerType {
                              "_attributes": {
                                "generic": {},
                                "typescript": {},
                              },
                              "_definition": {},
                              "_id": "19",
                              "_isCommutative": true,
                              "_name": "Tag",
                              "_options": {
                                "maxInclusive": true,
                                "minInclusive": true,
                              },
                              "_type": "integer",
                            },
                          ],
                          "_definition": {},
                          "_id": "21",
                          "_isCommutative": true,
                          "_type": "optional",
                        },
                        NodeTrait {
                          "_attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "_children": [
                            StringType {
                              "_attributes": {
                                "generic": {},
                                "typescript": {},
                              },
                              "_definition": {},
                              "_id": "20",
                              "_isCommutative": true,
                              "_name": "Tag",
                              "_options": {},
                              "_type": "string",
                            },
                          ],
                          "_definition": {},
                          "_id": "22",
                          "_isCommutative": true,
                          "_type": "optional",
                        },
                      ],
                      "_definition": {},
                      "_id": "23",
                      "_isCommutative": false,
                      "_name": "Tag",
                      "_options": {
                        "strict": false,
                      },
                      "_type": "object",
                      "shape": {
                        "id": NodeTrait {
                          "_attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "_children": [
                            IntegerType {
                              "_attributes": {
                                "generic": {},
                                "typescript": {},
                              },
                              "_definition": {},
                              "_id": "19",
                              "_isCommutative": true,
                              "_name": "Tag",
                              "_options": {
                                "maxInclusive": true,
                                "minInclusive": true,
                              },
                              "_type": "integer",
                            },
                          ],
                          "_definition": {},
                          "_id": "21",
                          "_isCommutative": true,
                          "_type": "optional",
                        },
                        "name": NodeTrait {
                          "_attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "_children": [
                            StringType {
                              "_attributes": {
                                "generic": {},
                                "typescript": {},
                              },
                              "_definition": {},
                              "_id": "20",
                              "_isCommutative": true,
                              "_name": "Tag",
                              "_options": {},
                              "_type": "string",
                            },
                          ],
                          "_definition": {},
                          "_id": "22",
                          "_isCommutative": true,
                          "_type": "optional",
                        },
                      },
                    },
                  ],
                  "_definition": {},
                  "_hooks": {
                    "onGenerate": [
                      [Function],
                    ],
                    "onLoad": [
                      [Function],
                    ],
                  },
                  "_id": "7",
                  "_isCommutative": true,
                  "_name": "tags",
                  "_options": {},
                  "_type": "ref",
                },
              },
            },
          }
        `)

        expect(
            updateExpression({
                shape: $ref(Pet),
                build: (existing, input) => {
                    return {
                        name: input.name!,
                        tags: existing.tags.listAppend(input.tags!),
                        photoUrls: existing.photoUrls.remove(),
                    }
                },
            }),
        ).toMatchInlineSnapshot(`
          {
            "attributeConstValues": {},
            "attributeNames": {
              "name": "#name",
            },
            "attributeValues": {
              "name": ":name",
              "tags": ":tags",
            },
            "expression": "SET #name = :name, tags = list_append(tags, :tags) REMOVE photoUrls",
            "inputSchema": {
              "name": StringType {
                "_attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "_definition": {},
                "_id": "26",
                "_isCommutative": true,
                "_name": "name",
                "_options": {},
                "_type": "string",
              },
              "tags": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "typescript": {},
                    },
                    "_children": [
                      JSONObjectType {
                        "_attributes": {
                          "generic": {},
                          "typescript": {},
                        },
                        "_children": [
                          NodeTrait {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_children": [
                              IntegerType {
                                "_attributes": {
                                  "generic": {},
                                  "typescript": {},
                                },
                                "_definition": {},
                                "_id": "42",
                                "_isCommutative": true,
                                "_name": "Tag",
                                "_options": {
                                  "maxInclusive": true,
                                  "minInclusive": true,
                                },
                                "_type": "integer",
                              },
                            ],
                            "_definition": {},
                            "_id": "44",
                            "_isCommutative": true,
                            "_type": "optional",
                          },
                          NodeTrait {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_children": [
                              StringType {
                                "_attributes": {
                                  "generic": {},
                                  "typescript": {},
                                },
                                "_definition": {},
                                "_id": "43",
                                "_isCommutative": true,
                                "_name": "Tag",
                                "_options": {},
                                "_type": "string",
                              },
                            ],
                            "_definition": {},
                            "_id": "45",
                            "_isCommutative": true,
                            "_type": "optional",
                          },
                        ],
                        "_definition": {},
                        "_id": "46",
                        "_isCommutative": false,
                        "_name": "Tag",
                        "_options": {
                          "strict": false,
                        },
                        "_type": "object",
                        "shape": {
                          "id": NodeTrait {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_children": [
                              IntegerType {
                                "_attributes": {
                                  "generic": {},
                                  "typescript": {},
                                },
                                "_definition": {},
                                "_id": "42",
                                "_isCommutative": true,
                                "_name": "Tag",
                                "_options": {
                                  "maxInclusive": true,
                                  "minInclusive": true,
                                },
                                "_type": "integer",
                              },
                            ],
                            "_definition": {},
                            "_id": "44",
                            "_isCommutative": true,
                            "_type": "optional",
                          },
                          "name": NodeTrait {
                            "_attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "_children": [
                              StringType {
                                "_attributes": {
                                  "generic": {},
                                  "typescript": {},
                                },
                                "_definition": {},
                                "_id": "43",
                                "_isCommutative": true,
                                "_name": "Tag",
                                "_options": {},
                                "_type": "string",
                              },
                            ],
                            "_definition": {},
                            "_id": "45",
                            "_isCommutative": true,
                            "_type": "optional",
                          },
                        },
                      },
                    ],
                    "_definition": {},
                    "_hooks": {
                      "onGenerate": [
                        [Function],
                      ],
                      "onLoad": [
                        [Function],
                      ],
                    },
                    "_id": "30",
                    "_isCommutative": true,
                    "_name": "tags",
                    "_options": {},
                    "_type": "ref",
                  },
                ],
                "_definition": {},
                "_id": "31",
                "_isCommutative": false,
                "_name": "tags",
                "_options": {},
                "_type": "array",
                "element": NodeTrait {
                  "_attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "_children": [
                    JSONObjectType {
                      "_attributes": {
                        "generic": {},
                        "typescript": {},
                      },
                      "_children": [
                        NodeTrait {
                          "_attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "_children": [
                            IntegerType {
                              "_attributes": {
                                "generic": {},
                                "typescript": {},
                              },
                              "_definition": {},
                              "_id": "42",
                              "_isCommutative": true,
                              "_name": "Tag",
                              "_options": {
                                "maxInclusive": true,
                                "minInclusive": true,
                              },
                              "_type": "integer",
                            },
                          ],
                          "_definition": {},
                          "_id": "44",
                          "_isCommutative": true,
                          "_type": "optional",
                        },
                        NodeTrait {
                          "_attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "_children": [
                            StringType {
                              "_attributes": {
                                "generic": {},
                                "typescript": {},
                              },
                              "_definition": {},
                              "_id": "43",
                              "_isCommutative": true,
                              "_name": "Tag",
                              "_options": {},
                              "_type": "string",
                            },
                          ],
                          "_definition": {},
                          "_id": "45",
                          "_isCommutative": true,
                          "_type": "optional",
                        },
                      ],
                      "_definition": {},
                      "_id": "46",
                      "_isCommutative": false,
                      "_name": "Tag",
                      "_options": {
                        "strict": false,
                      },
                      "_type": "object",
                      "shape": {
                        "id": NodeTrait {
                          "_attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "_children": [
                            IntegerType {
                              "_attributes": {
                                "generic": {},
                                "typescript": {},
                              },
                              "_definition": {},
                              "_id": "42",
                              "_isCommutative": true,
                              "_name": "Tag",
                              "_options": {
                                "maxInclusive": true,
                                "minInclusive": true,
                              },
                              "_type": "integer",
                            },
                          ],
                          "_definition": {},
                          "_id": "44",
                          "_isCommutative": true,
                          "_type": "optional",
                        },
                        "name": NodeTrait {
                          "_attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "_children": [
                            StringType {
                              "_attributes": {
                                "generic": {},
                                "typescript": {},
                              },
                              "_definition": {},
                              "_id": "43",
                              "_isCommutative": true,
                              "_name": "Tag",
                              "_options": {},
                              "_type": "string",
                            },
                          ],
                          "_definition": {},
                          "_id": "45",
                          "_isCommutative": true,
                          "_type": "optional",
                        },
                      },
                    },
                  ],
                  "_definition": {},
                  "_hooks": {
                    "onGenerate": [
                      [Function],
                    ],
                    "onLoad": [
                      [Function],
                    ],
                  },
                  "_id": "30",
                  "_isCommutative": true,
                  "_name": "tags",
                  "_options": {},
                  "_type": "ref",
                },
              },
            },
          }
        `)
    })
})
