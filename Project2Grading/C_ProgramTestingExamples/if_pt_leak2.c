#include <stdlib.h>

// Potential memory leak at the end
int main()
{
    // 2 memory blocks are created pointed to by ptr0 and ptr1
    int *ptr0 = malloc(sizeof(int));
    int *ptr1 = malloc(sizeof(int));

    // Conditionally free both blocks
    if (ptr0 > 0x10000)
    {
        free(ptr0);
        free(ptr1);
    }

    free(ptr0);

    return 0;
}
