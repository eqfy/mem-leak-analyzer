# Project2Group9


## Project description, motivation, use-case, and target users
In a nutshell, our program analysis attempts to statically estimate memory loss within a given C file. This includes producing errors for memory that is definitely lost: memory that is lost in all possible paths the program could take. As well as producing warnings for memory that is possibly lost: memory that is lost in >= 1 paths that the program could take.

The motivation behind this is quite obviously to help programmers reduce silly memory leaks which commonly occur when writing code in C. Memory leaks are bad because they block memory resources and degrade program performance over time, hence reducing the possibility of memory leaks poses a huge benefit for developers.

Given the relative simplicity of our analysis and scope, our tool would be most useful to beginner C programmers, especially those taking CPSC 213. They could use this tool to help reduce errors in their assignments or small programs they are creating, as well as leverage it as a way of learning and reinforcing the importance of memory management in C. However, expanding on this idea and increasing the accuracy, complexity, and scope of this project, could easily result in a tool that all programmers, regardless of skill level, could benefit from


## Why static C memory-loss analysis?
Why C? Because why not. Why memory leak analysis? Memory loss in C is an issue for reasons stated above. Why static? We wanted to provide programmers with quick, real-time feedback on the possibility of memory leaks without ever having to run their C program.


## General Project Progress (Milestone 1 all the way to Project Submission)
Admittedly, our timeline for this project fell more off track than our first project due to consistently being faced with problems. To start, we spent considerable (possibly too much) time trying to figure out what we wanted to focus on. After finally deciding, we got back on track and integrated the clang parser into our project and leveraged its produced AST. We soon realized that the produced JSON AST was extremely complicated and inflated with a lot of information we did not need for our analysis. Not having enough time to turn back, we pushed through, and took the route of attempting to create interfaces to represent the AST from an example-based approach, as clangs online documentation was way too complicated and uncentralized. We did this because, if we did not, we thought the JSON AST produced by clang would be way too challenging and time-consuming for our team to work with and understand. This took longer than expected. Then we were faced with another challenge of implementing the visitor pattern on a JSON AST, which we had no idea how to do. Then finally, only in the last few weeks, did we actually start on the implementation of the analyzer. Funny enough, although the most complex part of the project, this part was the part where we moved most quickly. Overall, we ended up getting the project completed with our original scope, however, there were times throughout where we fell unexpectedly behind.


## General User Study Results
### User Study 1
[User Study 1 Details](UserStudy_1.md)

We went over the design of our probability/scoring model and discovered that there indeed exist edge cases where it would fail or be too complicated to understand and implement for our project. Thus, we decided to go with a purely pessimistic three-state solution (memory exists, possibly exists, does not exist) as our base implementation.
### User Study 2
[User Study 2 Details](UserStudy_2.md)

We changed our error messages to include more information about what exactly a "Error" vs a "Warning" actually is - an error is a detection where the memory is definitely lost, no matter what, whereas a warning is a situation where there is a path through the program that the memory is lost.


## Scope
### Language Features Scope
- Scope item 1
- Scope item 2
### Analysis Scope
- See C_ProgramTestingExamples


## Analysis Explanation
### Program State General Explanation
lorem ipsum
### Analysis General Explanation
lorem ipsum
### Non-trivial Design / Analysis Implementation Explanation
lorem ipsum

## Room For Improvement (recognized flaws in our design, or other ways we could improve if we had more time)
### Flaw/Improvement 1 Description
lorem ipsum
#### How to remove flaw or improve? 
lorem ipsum
....
