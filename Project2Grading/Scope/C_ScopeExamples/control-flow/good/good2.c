#include <stdlib.h>

// Ideally, should be able to analyze it with no found errors
int main() {
    // 2 memory blocks are created pointed by ptr0 and ptr1
    int *ptr0 = malloc(sizeof(int));
    int *ptr1 = malloc(sizeof(int));
    int *ptr2;

    // a 3rd block might be created and pointed to by ptr2
    if (ptr0 > ptr1) {
        ptr2 = malloc(sizeof(int));
    }

    // free the first 2 blocks
    free(ptr0);
    free(ptr1);

    // this is either freeing the 3rd block or on a NULL pointer, either is ok
    free(ptr2);

    return 0;
}