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

Prerequisites: You must have clang installed on your system. The following command must be runnable within your terminal

`echo "#include <stdlib.h> int main() {return 0;}" | clang -x c - -Xclang -ast-dump=json -fsyntax-only`

1. Open VS Code (required)
2. Open this project
3. Run `npm install` in the project directory
4. Run `npm run compile` in the project directory
5. Navigate to the "Run and Debug" section of VS Code. Go to left panel, or hit (Command + Shift + D)
6. Go to the top left corner where the run configurations can be found
7. Click on "Launch Client". This should open up a new VS Code workspace
8. Within the new VS Code workspace, open up the project directory [Project2Grading/C_ProgramTestingExamples](Project2Grading/C_ProgramTestingExamples) folder. This folder contains test files that you can work with - but you can also create any .c files you want within this folder.
9. Edit file of choice
10. If there is a detected memory leak within the file you have open/edited, you should see a warning message, or error message, underneath the problematic code where the (possible) leak is detected.
11. If you have any troubles at all, just text 604-368-4730 first (so I do not think you are a spam caller), then call the same number 5 minutes later. Text/call at any time - I will answer unless I am sleeping.
