# Memory Issues in C

A draft idea is that all memory issues to explore in Project 2 should be tied to a common mental model: consider memory as multiple blocks of data. Declaring a local variable creates a new block, `malloc` creates another new block, etc. The exact details (start address/size) regarding these ranges can be estimated statically to some extent or ignored if not relevant, while they will definitely be known dynamically.

For the static and dynamic checker:
- Static checker can analyse on the AST generated from the C compiler.
- Dynamic checker can be implemented by inserting statements to the program (draft idea: maintain a collection of blocks representing memory in the start of the program, as well as inserting statements before/after memory related lines to extract details regarding the memory, assert extra conditions, and update the block collection).

**Note**: memory allocation calls in this document refer to `malloc`, `calloc`, `realloc` and `align_alloc` (introduced in C11, roughly `malloc` with additional alignment constraint, which can be treated just as `malloc` in the scope).

Scopes
- [Single-File Analysis](#single-file-analysis)
- [Single-Thread](#single-thread)

Static-Checking Memory Estimation
- [Memory Address](#memory-address)
- [Memory Block Size](#memory-block-size)

Explorable Ideas
- [Accessing Garbage Value in Valid Memory](#accessing-garbage-value-in-valid-memory)
- [Accessing Invalid Memory](#accessing-invalid-memory)
- [Memory Leak](#memory-leak)
- [Invalid free](#invalid-free)
- [Allocate Too Little Memory](#allocate-too-little-memory)

Flow Control / Structure
- [Function](#function)
- [If or Switch](#if-or-switch)
- [Loop](#loop)

Further Questions
- [Optimistic or Pessimistic](#optimistic-or-pessimistic)
- [Function Pointer](#function-pointer)
- [Recursion](#recursion)

## Scopes

### Single-File Analysis

Support for multi-file C program is out of scope. The analysis will be focused on a single `.c` file.

We will not be concerned with memory issues outside of the specific file. That is, if a user uses a library and calls a function which does `malloc`, but does not call the library function that `free`s the allocated memory, the analyzer will simply ignore that due to lack of information in the current file.

### Single-Thread

We will not be concerned with multi-threaded program.

## Static-Checking Memory Estimation

There will be quite a number of compromises to be made to make static checker useful. Below are some possible things to consider, while idea-specific ones are included in its own section in [Explorable Ideas](#explorable-ideas);

### Memory Address
Exact address comparison in static checking will be too challenging due to the amount of uncertainties. However, some checks can still be performed based on an offset from the start address of a memory block ("relative" memory address), though it is worth discussing whether they are viable, as the section below, [memory block size](#memory-block-size), would need static estimation as well.

### Memory Block Size
If memory allocation calls are called without a constant integer value such as 8 (not even 2 * 4), use estimation for its size, such as the same size as one unit of what the pointer type points to. Below is an estimation example:
```C
int *a = (int *)malloc(2048 * (2 << (5 - 1)));
// esimated into a smaller size:
int *a = (int *)malloc(sizeof(int));
```
This allows us to not focus on arithmetic computation as it is quite troublesome with how many operations C supports, and also we definitely cannot support if a dynamic-bounded value is used such as `2 * some_variable`. But as a tradeoff, if an estimation is made here, we might not be able to check for later statements that might have size issues with the current memory allocation call.

## Explorable Ideas

### Accessing Garbage Value in Valid Memory

When a variable is declared (assume that it does not have the `register` keyword), or using memory allocation calls except `calloc`, it will contain some garbage value if not assigned. For example:
```C
int a[5];
a[0];
```
Statically, as mentioned above in [memory block size](#memory-block-size), this would be challenging to check. It can be roughly estimated to "every memory block has to be assigned (even if it is just a part of it)". Of course it will not work perfectly, for example here line 3 is still accessing garbage value, because line 2 seems to assign values to this block, while in reality it is only 8 of the 100 bytes:
```C
int *a = malloc(100);
*a = 10;
*(a + 1);
```
But due to the constraint of a static checker, this estimation can verify garbage value to some extent.

### Accessing Invalid Memory

Below is a classic example of a segmentation fault:
```C
int *p = 0;
*p;
```

Or even if it is not considered "bad" memory in runtime, any hardcoded "absolute" memory address (numbers, constants) used to dereference a pointer can be considered invalid, as there is no certainty that that particular memory address is valid during any execution for any compiled program through any compiler. This excludes providing offset on top of an existing address (`*(p + 1)` for valid pointer `p`), which in a sense can be understood as a "relative" memory address and is acceptable.

Dynamically there is no issue keeping track of all the memory blocks and determine whether the dereferenced pointer value is entirely in one of the blocks.

Statically, as mentioned above in [Memory Size](#memory-size), this would be challenging to check. Currently consider this direction as something out of scope for the static checker.

### Memory Leak

A quick note is that to call `free` in C, you need the exact starting memory address returned by the memory allocation calls. The below example will free nothing and all 100 bytes will be lost:
```C
int *a = malloc(100);
free(a + 1);
```

Any memory not `free`d as the program finishes execution is considered a memory leak.

Dynamically as the checker can get sufficient information, something similar to [valgrind](https://developers.redhat.com/blog/2021/04/23/valgrind-memcheck-different-ways-to-lose-your-memory#generating_a_leak_summary) (containing reports for "definitely lost", "still reachable", "possibly lost" and "indirectly lost") can be implemented, though it would be fine to just report any un`free`d block without detailed categorications due to time constraint.

Statically however, they will not be as apparent. Below is an easy example to check statically:
```C
int *a = malloc(100);
free(a);
```

But what if there are arithmetic operations? As mentioned before, it is best to treat them as just dynamic value. Then we can not say for certain the following program does not cause a memory leak:
```C
int *a = malloc(100);
free(a + 1 - 1);
```

An intial idea is to enforce a stricter rule: the start address of every memory block must be associated with at least 1 pointer throughout the entirety of the program, which the static checker can keep track of. When calling `free`, one of these associated pointers have to be used directly. For example, static checker can detect that `a` and `b` both points to the starting address of the `malloc`ed block, so `free` with either is ok:

```C
int *a = malloc(100);
int *b = a;
free(b);
```

It should be acceptable to either go with a more pessimistic approach, where any `free` that does not satisfy the criteria will cause a reject, or it can be simply ignored (though by C standard, the behavior is undefined when a `free` is called on an incorrect address).

### Invalid Free

Similar to [memory leak](#memory-leak) which does not `free` all the allocated memory blocks, there is also the possibility of `free`ing too much or invalid `free`s.

Note that calling `free` on a NULL pointer does absolutely nothing, so it is not quite considered as invalid in this context. Though if wanted to enforce stricter programm rules, it could be added as well.

A `free` is considered to be invalid when a non-null pointer that is not the start of a memory block is used for `free`, for which the behavior is unspecified based on the C standard. for example:
```c
int *a = 0x1000;
free(a);
```

Dynamically as we know the address stored in the pointer and each memory block, so this is trivial to check.

Statically, as mentioned in the [memory leak](#memory-leak) section above, multiple pointers might contain addresses of the start of the memory block, in which case `free` with either one is acceptable, but it also should prevent any of them to be used to `free` again if the addresses they point to remain unchanged, for example the second free here is invalid:

```c
int *a = (int *)malloc(100);
int *b;
free(a);
free(b);
```

This idea should be closely considered with [memory leak](#memory-leak) during exploration or implementation.

### Allocate Too Little Memory

Below is an example of "allocating too little memory":
```C
int *a = malloc(1);
```

To be exact, this is not an immediate problem in C, since as long as `a` is dereferenced after being casted to a byte pointer, it will only be accessing the single byte allocated, thus not accessing invalid memory. But due to how it is almost impossible to implement a good static checker for invalid memory access as discussed [above](#accessing-invalid-memory), it might be worthwhile to be more "proactive" in preventing related issues, in this case reporting an error statically during the `malloc` call, if the memory size allocated is smaller than the size of even one value of type the pointer dereferences into (in this case size of `int`).

There is a more possible scenario of user type casting from a smaller pointer type to a larger one later on in the program like below:
```C
byte *a = malloc(100);
*(int *)a;
```

And this example will be acceptable by the checker rule, as the allocated size is large enough for at least 1 byte.

And same as discussed before, the check is skipped when the size to be allocated is not a fixed number or a constant, i.e. is unknown at compile time.

Dynamically this will be straightforward to check: record the size before sending into memory allocation calls and compare it with the element size of type the pointer dereferences into. Or better if dynamic analysis is implemented for accessing invalid memory, this proactive approach is not needed dynamically as we will be accurately tracking each dereferencing anyway.

## Flow Control / Structure

### Function

Functions should be able to be handled with implementation to take care of scopes (for example, memory blocks for local variables after exiting a function should be `free`d automatically).

### If or Switch

Either go with an exhaustive approach and limit the total number of branches, or go with an optimistic/pessimistic approach discussed in lecture. Could be discussed further.

### Loop

With the limitation of unknown number of iterations in a program, it might be necessary to estimate a loop as an if statement (that is, consider the possibility of the loop being executed 0 or 1 times).

## Further Questions

### Optimistic or Pessimistic

Is it acceptable that a static analyzer violates both following conditions:
- Reports no errors when there is an error
- Reports an error when there is no errors

That is, can it violate 2 out of the 4 impossible principles for non-trival language analysis?

### Function Pointer

Should function pointers be treated just like functions? Are there some potential missing edge cases not considered?

### Recursion

Yet to be discussed.


functions
conditionals
structs
loops
alias'
(macros??)
