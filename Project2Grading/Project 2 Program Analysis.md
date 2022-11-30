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
### Supported C Language Features Scope
- Memory:
	- Supports `malloc()`, `calloc()`, `align_alloc()`
	- Dereference operator (*)
	- Address operator (&)
- Control flow:
	- If, Else If, Else
	- Switch statements (if there is only Case and Default statements)
	- For loops
	- While loops
	- Do While loops
	- Break statement
	- Return statement
- Operator:
	- Assignment operator (=)
- Function calls
	- With return statements
	- With arguments
- Scopes (Any curly bracket pair)
- Structs
	- Recursive construction (when a member is another struct)
	- Member access

### Analysis Scope
- See C_ProgramTestingExamples

## Non-trivial Design / Analysis Implementation Explanation

### The three states analysis
In our program, we use 3 states to represent the existence of memory blocks and pointer points to relationships. The three states are:
- Definitely
- Maybe
- Never (definitely not)
- 
#### Pointer Relations (ex: a --> block b)
- Definitely means that we know for sure, even when considering all different branches of conditionals etc., that pointer ```a``` still points to block b
- Maybe means that pointer ```a``` maybe points to block b. For example, if in ONE branch of an if/else statement, the pointer gets re-assigned. After the if statement, we only know that pointer ```a``` maybe points to block b.
- Never (definitely not) means that we know for sure, even when considering all different branches of conditionals etc.,  that pointer ```a``` does not point to block b
- 
#### Heap Memory Existence (ex: block b)
- Definitely means that we know for sure, even when considering all different branches of conditionals etc., that block b still exists on the heap and has not been freed
- Maybe means that block b maybe still exists on the heap. For example, if in ONE branch of an if/else statement, the block is freed. After the if statement, we only know that block b maybe exists on the heap (because it wasnt freed in the other branch).
- Never (definitely not) means that we know for sure, even when considering all different branches of conditionals etc., that the block b no longer exists on the heap


### Handling loops
Loops are handled in a our program in a certain way. Specifically, we always analyze loops as if they ran zero time, one time or two times. The exception to this rule are the `do {} while ()` loops which are analyzed one time or two times. 

One interesting side effect of this analysis is that our `free()` statements in the loop body are often categorized as potentially invalid pointers. This is because we free the pointer on the first iteration and attempt to free the pointer again on the second iteration.

Inside loops, it is also possible to use `break` and `return` statements which will stop the usual one time or two times analysis. See more about `break` and `return` in the *Supporting signals raised by `break` and `return` keywords* section.

### Handling scopes with "containers"
Scopes are distinctively handled in our program compared to how we did it in project 1. In project 1, scopes were simply implemented by passing in a copy of the current program state to the next scope. Although this worked well for functions, it was a pain to work with for loop and if/else. For project 2, we instead adopted the idea of "containers" based on memory blocks, a fundemental element of our analysis. 

Scopes work as folowing in our project. For every scope, a special memory block called a container is created with the `createContainer()` function. Internally, all memory blocks and memory pointers created in the current scope will have their parent block set to the most recently created container. Then once the analyzer exits out of the scope, the `removeContainer()` function is called which removes all the memory blocks and points that have the current container as the parent. This effectively achieves the effect of scopes. At the very beginning of the program analysis at `main()`, a initial container called the `StackContainer` is created to represent the stack. One exception to all of this are the memory blocks created with memory allocation calls such as `malloc` which have their parent set to `undefined` because they live in the heap memory, and so will any of the blocks or pointers which they contain.


### Supporting signals raised by `break` and `return` keywords
In C control flow, there are key words like `break`, `return`, and `continue` that changes the control flow (which we call signals). In more general cases, the interaction between signals and control flow is rather non-trivial. For example, in the following program, the `if` branch returns from main while the `else` branch continues down main. As our analyzer wants to immediately merge the state after a control flow operation, we must merge the signals of the two branches. The design decision is to follow the "pessimistic approach". Specifically, our "pessimistic approach" says that return has higher priority than break which has higher priority than null. 

In this example, we conclude that the merged signal is `return` because `return` has higher priority compared to `null`. Hence, after the merging of program state after the `if/else`, we do not analyze anything further done.  

```C
int main() {
	int * a = malloc(sizeof(int)); // Report possibly leaked
	int * b = malloc(sizeof(int)); // Report definitely leaked
	if (1) {
		free(a);
		return;  // Signal is return
	} else {
	}            // Signal is null
				 // Merged signal is return
	free(b);     // Not analyzed
	...
}
```

We recognize that an alternative design is to have null signal be the highest priority. If we adopt that approach, then we will always try to analyze the following things if at least one branch can lead to it.

Finally, `continue` is unsupported in our current analyzer due to the lack of time. We envision that the implementaiton for `continue` is straightforward for easier cases (directly in loops). For more complex examples (e.g. the `continue` is in a switch statement that is inside a loop), we may need to propogate two signals at once because there might also be a signal for `break` in a switch case statement.

### Structs

Structs are where the original idea of blocks come from: a block can contain other blocks or pointers, which is a nice 1-to-1 mapping to a struct can contain some non-pointer members (or even sub-structs) or pointers. The program state keeps a mapping from struct names to struct definitions, so whenever a new struct is constructed by the visitor, it will populate the said memory block with sub-blocks or pointers recursively. Struct member access is implemented by following this hierarchy: for `a.b`, simply get the member within `a`'s contain that has name `b`; alternatively for `a->b`, reach the block pointed by `a` first, then do the same as before.

### Temporary blocks and pointers

We make use of temporary blocks and pointers that will be removed once getting out of scope (scope discussed in a prior section) frequently in our analysis. For example, `malloc` creates a memory block in our program state, but it also creates a `void` pointer (the return value) to said block, which is also recorded in our program state. Then if `int *ptr = malloc(...)`, the `void` pointer has what it points to (currently, just the heap block) to `ptr`. This is but one example of how these temporary blocks or pointers can be of use in our visitor - sometimes expressions can be rather nested, and creating these easily-disposable units can help us propogate information more efficiently without sacrificing accuracy (removed once out of scope).

### Merge blocks and pointers
Among all possible visitor return values in our analysis, there are two of interest here: a list (1 or more) of blocks, or a list (1 or more) of pointers. For example, let's say a pointer `ptr` is possibily pointing to either `a` or `b`. What if now I try to visit `*ptr`? It should be [`a`, `b`]. By allowing these to be represented in list, we can preserve more accurate information until we need to merge them.

Following the example above, let's say now some `ptr2` = `*ptr`. The problematic thing is we have a list of possible values ([`a`, `b`]) to be assigned to `ptr2`, but there should only be one assignment. So for scenarios like these where the values need to converge, we implement a merger for a list of pointers into a single one that points to everything that list of pointers point to, as well as a merger for a list of blocks (we assume program is well typed, so can only merge structs of same type together, for example) that recursively merge what it contains. There might even be cases where left hand side of the assignment have multiple possible values, all of which are handled in our visitor function for `BinOperator`.

## Room For Improvement (recognized flaws in our design, or other ways we could improve if we had more time)

#### How to remove flaw or improve? 
lorem ipsum


### Flaw/Improvement 2 Description
Stop being fully value agnostic - we do not care at all about the conditions in control flow statements. However, there are simple cases where we should be able to calculate the value of the condition. Some examples include:
```c
// Constant expression and operations just involving constants
if (1) {}
if (2 + 3 < 6) {}

// Variables that have their value known
int a = 2
if (a) {}
while (a * 2) {}

// Statically defined arrays
int a[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
if (a[2] > 0) {}
```

#### How to remove flaw or improve?
For these simple cases, we can "evaluate" the values statically by directly evaluating constants and keeping track of variables in a table. For variables, as long as we know its precise value, we can simulate C's evaluation. However, if the variable is unknown statically, (e.g. function argument, user input etc.), then we may need more advanced analysis tools like symbolic execution.


### Flaw/Improvement 3 Description
Supporting multiple files and with headers - currently we only support programs from one file and no header. 

#### How to remove flaw or improve?
Clang actually constructs an AST that includes everything (including other files and library functions). Hence, we need to be able to do some more advanced filtering of the produced AST to locate all the user created files. We should also be able to map user-defined header files to their implementation by preprocessing the AST nodes.


### Flaw/Improvement 4 Description
Modular analysis of functions - our current implementation analyzes the program by following the control flows and trying to "run" the program. However, this breadth-first-search style approach may lead to poor performance if there are many branches. 

#### How to remove flaw or improve?
The alternative is to support a modular analysis of functions. For each function, we can potentially generate the preconditions and the post conditions and put them in a function data table. Then, we directly grab these function data whenever we encounter a call statement in some function and do not let the analyzer go into that function.

### Flaw/Improvement 5 Description
Supporting array syntax - we do not support any notion of arrays in C.

#### How to remove flaw or improve?
Populating its related ASTs with Clang, and implementing similar to other ASTs. Unless our program is not entirely value agnostic, the number of elements in the array information will still be ignored. It is more of a syntactic sugaring for the pointer type in our current scope.
