#include <stdlib.h>

// Similar to bad3.c in simple-structure which emphasizes on scope
// All allocated memory blocks should always have at least 1 pointer pointing to it
// Ideally, should be able to analyze it with a found leak at the end of func1 and line 18
void func1()
{
    // allocate a block and assign it to a pointer that expires right after
    int *a = malloc(sizeof(int));
}

int *func2()
{
    return malloc(sizeof(int));
}

int main()
{
    func1();

    // no pointer to hold the address
    func2();

    return 0;
}