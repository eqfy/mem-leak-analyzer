#include <stdlib.h>

// Change to a pointer address occuring in a different function
// Ideally, should be able to analyze it with a leak on line 15
void func1()
{
    int *ptr = malloc(sizeof(int));

    // this effectively changes ptr so ptr no longer points to the memory block
    adder(&ptr);

    free(ptr);
}

void func2(int **addr)
{
    *addr = *addr + 1;
}

int main()
{
    func1();

    return 0;
}