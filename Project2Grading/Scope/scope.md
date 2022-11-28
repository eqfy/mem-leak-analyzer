# C Static Analyzer on Memory Allocation and Free

Note that all C programs in this document without function syntax is assumed to be contained in a main function.

[Constraints](#constraints)

- [Single-File Analysis](#single-file-analysis)
- [Single-Thread](#single-thread)
- [Sufficient Memory](#sufficient-memory)
- [Positive Allocation Size](#positive-allocation-size)

[Memory Calls](#memory-calls)

- [malloc](#malloc)
- [calloc](#calloc)
- [aligned_alloc](#aligned_alloc)
- [free](#free)
- [realloc](#realloc)

[Examples](#examples)

## Constraints

### Single-File Analysis

Support for multi-file C program is out of scope. The analysis will be focused on a single `.c` file.

We will not be concerned with memory issues outside of the specific file. That is, if a user uses a library and calls a function which does [`malloc`](#malloc), but does not call the library function that [`free`](#free)s the allocated memory, the analyzer will simply ignore that due to lack of information in the current file.

### Single-Thread

Support for multi-threading is out of scope. That is, a multi-threaded program will be treated as a single-threaded one with all threading calls ignored.

### Sufficient Memory

Some memory allocations can result in NULL pointers if there is insufficient memory to be allocated. Since this information is unknown at compile time, it is assumed that the program will have sufficient memory to be allocated, and memory allocation calls always result non-NULL pointers.

### Positive Allocation Size

If a memory allocation call (such as [`malloc`](#malloc)) is called with an allocation size of 0, it might result in a NULL-pointer or a valid pointer that can be freed but not dereferenced. Due to the dynamically-bound nature of the size value, it is assumed that the program will always make these calls with positive allocation sizes.

## Memory Calls

### malloc

It allocates a memory block in memory and returns its address:

```C
// ptr is a pointer to an int in the heap
int *ptr = malloc(sizeof(int));
```

Pointer type and allocation size are not in scope of interest.

### calloc

It allocates a memory block (interpreted as an array of elements), sets every byte in it as 0 and returns its address:

```C
// ptr is a pointer to the first element of an array of 10 ints in the heap
int *ptr = calloc(10, sizeof(int));
```

For in-scope analysis purpose (not concerned with garbage value), this will be treated the same as a [`malloc`](#malloc).

### aligned_alloc

It allocates a memory block (interpreted as an array of elements) with alignment constraint:

```C
// ptr is a pointer to the first element of an aligned array of 10 ints in the heap
int *ptr = aligned_alloc(10, sizeof(int));
```

For in-scope analysis purpose (not concerned with alignment), this will be treated the same as a [`malloc`](#malloc).

### free

It frees the memory block previously created with a memory allocation call, and all pointers with the address of the freed block will become dangling pointers. `free` does nothing when being called with a NULL pointer, but might have unspecified behavior when called with a dangling pointer (but it is out of scope to analyze):

```C
// ptr is a pointer to an int in the heap
int *ptr = malloc(sizeof(int));

// ptr is now dangling
free(ptr);
```

For analysis purpose, all `free`s on pointers that are dangling or not the address of any memory block will be treated as potentially illegal.

### realloc

It reallocates the memory block with the specified address, which has to be the start of a memory block created with a memory allocation call, and the content is copied over to the new memory block:

```C
// ptr is a pointer to an int in the heap
int *ptr = malloc(sizeof(int));

// ptr is a pointer to the first element of an aligned array of 10 ints in the heap
ptr = realloc(ptr, sizeof(int) * 10);
```

For in-scope analysis purpose (not concerned with garbage value), it is assumed that `realloc` is simply a 2-step application of [`free`](#free) and [`malloc`](#malloc), so the above program is equivalent to:

```C
// ptr is a pointer to an int in the heap
int *ptr = malloc(sizeof(int));

// ptr is now dangling
free(ptr);

// ptr is a pointer to the first element of an aligned array of 10 ints in the heap
ptr = malloc(sizeof(int) * 10);
```

## Examples

All examples are in the [./examples](../examples) directory. Note that the good or bad represents ideally whether the analyzer should report no memory leaks or some, not that the final implementation will necessarily match them fully.

They are grouped in the following order:

### Simple Structure

These are the examples with neither control flow nor function calls.

### Control Flow

These are examples with control flows (if, switch, loop, etc.)

### Function

These are examples with some functions other than main that are called by main.

### Complex Structure

These are examples with both control-flow and usage of non-main functions, mainly recursion currently.
