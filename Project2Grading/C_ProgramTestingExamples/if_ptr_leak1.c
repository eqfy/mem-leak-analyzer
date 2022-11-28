#include <stdlib.h>

int main()
{
    // 2 memory blocks are created pointed to by ptr0 and ptr1
    int *ptr0 = malloc(sizeof(int));
    int *ptr1 = malloc(sizeof(int));
    int *ptr2;

    // ptr2 is an alias for either ptr0 and ptr1
    if (ptr0 > ptr1)
    {
        ptr2 = ptr0;
    }
    else
    {
        ptr2 = ptr1;
    }

    // this only frees one block, so the other one is leaked
    free(ptr2);
    return 0;
}
