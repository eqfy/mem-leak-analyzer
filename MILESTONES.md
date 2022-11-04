# Milestones

## Milestone 1

### Progress So Far
We discussed as a group and brainstormed about 10+ ideas for our project. Some of them were either lacking in complexity, or too complex. With the help of our TA, we eliminated ones not worth pursuing. What resulted is a list of 4 ideas that we are going to flush out and decide which to progress forward with. The ideas are listed below:

1. Create a static linter with a specific use case in mind (similar to ESLINT, for example. But a linter with rules that we create from scratch)
2. Create a static path visualizer that displays to users the different paths a program can take (for example, and IF statement would result in two paths). Then statically provide the user with a set of inputs that would allow the program to navigate down a path they chose.
3. Create a static checker to (estimate) memory related issues in C or C++
4. Create a static checker to (estimate) certain dynamic errors that could occcur (choose either super easy ones, or choose a single dynamic error and focus on that, as the anaylsis is non-trivial and difficult)

### Planned follow-up tasks for the next week.
1. Discuss our ideas further and finalize our idea
2. Scope our project very concretely
3. Mockup a sample program that our project should be able to analyze
4. Describe the desired output that our project should produce for said program
5. User study, if possible

## Milestone 2

### Brief description of your planned program analysis (and visualisation, if applicable) ideas.
In a general sense, our program analysis is going to attempt to statically check for memory leaks in C. The output will likely be a combination of red and orange underlines on the problematic C code, with applicable error messages upon hovering over the code (delivered through a VS Code Extension / Language Server). Our scope limits to one C file, a single thread, including functions, structs, conditionals, loops, and aliases, if everything goes according to plan.

### Notes of any important changes/feedback from TA discussion.
The biggest change is that we went from the entire document ./scopes.md and narrowed it down all the way to the scope listed above. As well as got some good opinions on how to handle situations where the behaviour within the C code is unspecified.

### Any planned follow-up tasks or features still to design.
We still need to iron out some minor details and develop a more concrete scope, along with some example inputs/outputs.

### Planned division of main responsibilities between team members.
1. Kyle will set up the project and handle all the language server portion.
2. Eric and Maxwell will lead the approach to the analysis and set up all the key data structures / function stubs necessary.
3. Micheal and Aidan will fill in lots of the function stubs, which will make up a majority of the implementation.

### Summary of progress so far
Lots of ideation and conversations around resulting ideas. Eventually concluding on a single idea. Then narrowing the scope significantly.

### Roadmap for what should be done when, including specific goals for completion by future Milestones (propose at least three such goals per future Milestone, along with who will work on them; you can revise these later as needed).

#### Milestone 3
1. Scope extremely well defined - All members
2. Concrete code examples with ideal outputs - Mostly Maxwell, however other members may help a bit
3. Project setup, parser integration into project, vscode extension setup, language server setup - Kyle

#### Milestone 4
1. Form the base of the project (classes, fields, function stubs, file structure, etc) - Maxwell and Eric
2. Ensure everyone in the group has a clear understanding of how everything will come together in the end
3. Start implementing function stubs where possible - Michael and Aidan
4. Start language server implementation - Kyle

#### Milestone 5
1. Finish langauge server implementation - Kyle
2. Finish analysis implementation - All 
3. Lots of testing!
