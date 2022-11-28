#include <stdlib.h>

// Switch is just if, but should also look out for fall-throughs like case 0 and 1 in the example below
// Ideally, should be able to analyze it with no found errors
int main() {
    // 2 memory blocks are created pointed by ptr0 and ptr1
    int *ptr0, ptr1;

    switch (1) {
        case 0:
        case 1:
            ptr0 = ptr1;
        default:
            // always allocate a block (even for case 0 and 1)
            ptr1 = malloc(sizeof(int));
    }
    /* Above can be converted into:
        if (1 == 0 || 1 == 1) {
            ptr0 = ptr1;
        }
        ptr1 = malloc(sizeof(int));
    */

    // free the allocated block
    free(ptr1);

    return 0;
}