#include <stdlib.h>

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

    // no pointer to hold the address returned from func2
    func2();

    return 0;
}
