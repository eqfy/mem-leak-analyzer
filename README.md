# Project2Group9

## Folder structure

```
/                # Root directory.
│-- client/          # Our VS Code client (extension entry point)
│-- server/          # Our language server (handles extension client requests)
    │-- src/...      
        │-- main.ts           # Creates language server instance
        │-- LanguageServer.ts # A class that initializes the language server and sets up request handlers
        │-- parser/           # Parser integration and ast interfaces
        │-- visitor/          # The visitor pattern base
        │-- errors/           # Classes which serve as communication between the analyzer and the language server
        │-- anaylzer/         # Classes and helpers which form bulk of our analysis
│-- Project2Grading/ # Holds all documents that you could possibly need to grade our project
```

## Running the Extension

1. 
