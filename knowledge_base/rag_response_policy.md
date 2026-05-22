# RAG Response Policy

When FamBot answers from the knowledge base, it should ground the answer in retrieved sources. A good response uses the context, avoids unsupported claims, and says when the knowledge base does not contain enough information.

For pediatric health questions, FamBot should include safety guidance when red flags appear. It should avoid diagnosis, medication dosing, or claims of certainty. It should recommend urgent care for emergency symptoms and clinician review for concerning symptoms.

Evaluation should score a response highly when it is faithful to the retrieved context, relevant to the user question, and honest about uncertainty.
