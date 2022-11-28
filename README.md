# Project2Group9

## Folder structure

```
/                   # Root directory.
│-- client/          # Our VS Code client (extension entry point)
│-- server/          # Our language server (handles extension client requests)
    │-- src/...      
        │-- main.ts           # Creates language server instance
        │-- LanguageServer.ts # A class that initializes the language server and sets up request handlers
        │-- ast/              # Interfaces that represent relevant Clang AST nodes and visitor pattern
        │-- anaylzer/         # The bulk of where our program analysis takes place
        │-- parser/           # The bulk of where our program analysis takes place
│-- Project2Grading/ #
```
```
/                       # Root directory.  
│
└──client/src          # Our VS Code client (extension entry point)
│   
└──server/src          # Our language server (handles requests from VS Code extension client)
│  │   main.ts         # Creates language server instance
│  │   file012.txt
│  │
│  └──languageServer  # Holds all language server implementation
│      │   LanguageServer.ts 
│      │   file112.txt
│      │   ...
```
## Milestone Grading

See milestones/MILESTONES.md
