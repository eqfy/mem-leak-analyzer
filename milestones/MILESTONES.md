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

In a general sense, our program analysis is going to attempt to statically check for memory leaks in C. The output will likely be a combination of red and orange underlines on the problematic C code, with applicable error messages upon hovering over the code (delivered through a VS Code Extension / Language VisualizerServer). Our scope limits to one C file, a single thread, including functions, structs, conditionals, loops, and aliases, if everything goes according to plan.

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

## Milestone 3

### Mockup of how your project is planned to operate

In general, our project plans to analyze a C file that a user has open within their VS Code instance. Once analyzed, if there are no memory leaks, the user will not see any errors. Otherwise, the user will be displayed all occurrences of the two following scenarios:

1. If there is a possible memory leak (in the case the analyzer can not 100% determine the correctness of prediction), the user will see an orange "warning" underline underneath the appropriate section of code where the possible memory leak is detected. Upon hovering over the warning, the user will be able to see further details about the memory leak.
2. If there is guaranteed to be a memory leak, the user will see a red "error" underline underneath the appropriate section of code where the memory leak is detected. Upon hovering over the error, the user will be able to see further details about the memory leak.

Examples of programs with and without memory leaks can be found in the [./examples](../examples) directory.

We also may provide the user a visual representation of the pointers in their program.

### Notes about first user study results.

Please see [./userstudy1](./userstudy1.md)

### Any changes to original design.

We have made our scope more concrete as described in [./scope](./scope.md) and through browsing the examples in [./examples](../examples). We have also decided to go with a pessimistic 3 state design that classifies memory leaks into 3 categories "definitely" "maybe" and "definitely not".

### Progress against the timeline planned for your team, including the specific goals you defined (as part of Milestone 2) for Milestone 3; any revisions to future Milestone goals.

#### Milestone 3 [ALL ITEMS COMPLETE ON TIME]

1. Scope extremely well defined - All members
2. Concrete code examples with ideal outputs - Mostly Maxwell, however other members may help a bit
3. Project setup, parser integration into project, vscode extension setup, language server setup - Kyle

#### Milestone 4 [#5 added]

1. Form the base of the project (classes, fields, function stubs, file structure, etc) - Maxwell and Eric
2. Ensure everyone in the group has a clear understanding of how everything will come together in the end
3. Start implementing function stubs where possible - Michael and Aidan
4. Start language server implementation - Kyle
5. (if we decide to do a visualization) Start implementing the visualization frontend - Maxwell and Kyle

#### Milestone 5 [#5/6 added]

1. Finish langauge server implementation - Kyle
2. Finish analysis implementation - All
3. Lots of testing!
4. (if we decide to do a visualization) Finish the visualization frontend - Maxwell and Kyle
5. (if we have time and feel like it) Implement a multiple-state design to replace our 3-state design in order to improve predictions - Eric, Michael, and Aidan

## Milestone 4
### Status of implementation so far.
1. WIP implementing a bunch of interfaces that correspond to the AST json output of a parsed C file by Clang
2. WIP implementing a visitor interface that will be leveraged for walking the file and analysis.

### Plans for final user study.
We hope to have the bulk of the implementation done by Thursday next week so that we can provide users a full experience of being able to open a C file in VS Code and then have memory related errors show to them on the screen.

### Planned timeline for the remaining days.
1. Friday/Saturday - Maxwell, Kyle, and possibly Eric form the base of the project
2. Friday/Saturday - Kyle finished Language server implementation and provides team with very clear interfaces and functions to leverage and produce the errors
3. Saturday - Maxwell and Kyle explain progress and steps forward to remaining of team 
4. Sunday-Monday - All team members work on analyzer implementation
5. Monday - Meeting to discuss next steps and ensure alignment
6. Monday-Thursday - All team members finish implementation
7. Thursday - User study
8. Thursday-Saturday - Changes / Project clean up / Improvements
9. Saturday/Sunday - Video / Project finish
### Progress against the timeline planned for your team, including the specific goals you defined (originally as part of Milestone 2) for Milestone 4; any revisions to Milestone 5 goals.

#### Milestone 4 (Slightly behind schedule according to sickness and other unpredicted events)
1. [WIP - Done by Sat afternoon] Form the base of the project (classes, fields, function stubs, file structure, etc) - Maxwell, Eric, and Kyle
2. [TO BE DONE Sat afternoon] Ensure everyone in the group has a clear understanding of how everything will come together in the end
3. [TO BE DONE Sat Afternoon-Monday] Start implementing function stubs where possible - Michael and Aidan
4. [WIP - Done by Sat afternoon] Start language server implementation - Kyle
5. [WIP - Most likely will be implemented over the weekend by Kyle] (if we decide to do a visualization) Start implementing the visualization frontend - Maxwell and Kyle

#### Milestone 5 (Should be on track by Monday to complete everything by the time of M5 submission)

1. Finish langauge server implementation - Kyle
2. Finish analysis implementation - All
3. Lots of testing!
4. (if we decide to do a visualization) Finish the visualization frontend - Maxwell and Kyle
5. (if we have time and feel like it) Implement a multiple-state design to replace our 3-state design in order to improve predictions - Eric, Michael, and Aidan

## Milestone 5
### Status of final user study; any feedback and changes planned
Since we have not finished the implementation but plan to wrap up the majority of it by Sunday (while potentially cutting down some less relevant language features), the final user study is planned to be conducted on Monday. We will then attempt to address all the feedback, implementing some if feasible, otherwise stating in text how we may want to address them.

### Plans for final video (possible draft version)
No draft version ready at the moment, but it will be made after the final user study is conducted. We will emphasize on the conceptual model behind our memory leak analyzer without diving too much into specific language features (like how is a do...while loop handled), and potentially demonstrate 1-2 representative examples as part of it. We will also briefly discuss about the results of our two user studies and how the first one affected the current design.

### Planned timeline for the remaining days

1. (by end of Friday / early Saturday) Finish implementing the analyzer with neither control-flow nor functions (assume to only have a main).
2. (by end of Saturday) Finish compiling a complete set of small unit test files.
3. (by end of Sunday) Finish implementing control-flow and function support for the analyzer.
4. (by end of Monday) conduct the final user study, finish documentation on program state and the set of language features our analyzer supports.
5. (by end of Tuesday) compile the final user study result, create the final video (+ any slides / demo examples used in it).

### Progress against the timeline planned for your team, including the specific goals you defined (originally as part of Milestone 2) for Milestone 5

We are pretty behind the original planned timeline mainly due to a lack of understanding of clang's AST structures. Below is the list of original Milestone 5 goals and where we are at currently for each of them.

#### Milestone 5

1. Finish langauge server implementation - done
2. Finish analysis implementation - not complete as described above
3. Lots of testing! - currently have some test cases (large and few - mainly used to explore clang AST structure), but small unit tests will be preferred
4. (if we decide to do a visualization) Finish the visualization frontend - this is most likely going to be cut out due to time constraint (not in current planned timeline)
5. (if we have time and feel like it) Implement a multiple-state design to replace our 3-state design in order to improve predictions - this is most likely going to be cut out due to time constraint (not in current planned timeline)
