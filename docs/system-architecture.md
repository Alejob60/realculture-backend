# System Architecture Overview

## Component Interaction Flow

```mermaid
graph TB
    A[Frontend] --> B[Backend API]
    B --> C[PromptJsonController]
    C --> D[PromptJsonService]
    D --> E[Video-Generator Microservice]
    E --> F[LLM Service]
    
    subgraph "Main Backend"
        B
        C
        D
    end
    
    subgraph "Microservice"
        E
        F
    end
    
    F --> G[Azure OpenAI]