# Memory Issues in C

A draft idea is that all memory issues to explore in Project 2 should be tied to a common mental model: consider memory as multiple blocks of data. Declaring a local variable creates a new block, `malloc` creates another new block, etc. The exact details (start address/size) regarding these ranges can be estimated statically to some extent or ignored if not relevant, while they will definitely be known dynamically.

For the static and dynamic checker:
- Static checker can analyse on the AST generated from the C compiler.
- Dynamic checker can be implemented by inserting statements to the program (draft idea: maintain a collection of blocks representing memory in the start of the program, as well as inserting statements before/after memory related lines to extract details regarding the memory, assert extra conditions, and update the block collection).

**Note**: memory allocation calls in this document refer to `malloc`, `calloc` and `realloc`.

Scopes
- [Single-File Analysis](#single-file-analysis)
- [aligned_alloc](#aligned_alloc)

Static-Checking Memory Estimation
- [Memory Address](#memory-address)
- [Memory Block Size](#memory-block-size)

Explorable Ideas
- [Accessing Garbage Value in Valid Memory](#accessing-garbage-value-in-valid-memory)
- [Accessing Invalid Memory](#accessing-invalid-memory)
- [Memory Leak](#memory-leak)

Flow Control
- [Function](#function)
- [If or Switch](#if-or-switch)
- [Loop](#loop)

## Scopes

### Single-File Analysis

Support for multi-file C program is out of scope. The analysis will be focused on a single `.c` file.

We will not be concerned with memory issues outside of the specific file. That is, if a user uses a library and calls a function which does `malloc`, but does not call the library function that `free`s the allocated memory, the analyzer will simply ignore that due to lack of information in the current file.

### aligned_alloc

aligned_alloc is a memory allocation call that enforces alignment introduced in C11. It might or might not be considered as a memory allocation call like the other 3 mentioned.

## Static-Checking Memory Estimation

There will be quite a lot of compromises to be made to make static checker useful. Below are some possible things to consider, while idea-specific ones are included in its own section in [Explorable Ideas](#explorable-ideas);

### Memory Address
Exact address comparison in static checking will be too challenging due to the amount of uncertainties. However, some checks can still be performed based on an offset from the start address of a memory block, though it is worth discussing whether they are viable, as the section below, [memory size](#memory-size), would need static estimation as well.

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
Statically, as mentioned above in [Memory Size](#memory-size), this would be challenging to check. It can be roughly estimated to "every memory block has to be assigned". Of course it will not work perfectly, for example here the 3rd line is still accessing garbage value:
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

Dynamically there is no issue keeping track of all the memory blocks and determine whether the dereferenced pointer value is entirely in one of the blocks.

Statically, as mentioned above in [Memory Size](#memory-size), this would be challenging to check. Currently still considering what a static checker can verify approximately in this scenario.

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

## Flow Control

### Function

Functions should be able to be handled with implementation to take care of scopes (for example, memory blocks for local variables after exiting a function should be `free`d automatically).

### If or Switch

Either go with an exhaustive approach and limit the total number of branches, or go with an optimistic/pessimistic approach discussed in lecture. Could be discussed further.

### Loop

With the limitation of unknown number of iterations in a program, it might be necessary to estimate a loop as an if statement (that is, consider the possibility of the loop being executed 0 or 1 times).