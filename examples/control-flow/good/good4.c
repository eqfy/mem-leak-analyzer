#include <stdlib.h>

// Ideally, should be able to analyze it with no found errors
int main() {
    int *ptr0 = malloc(sizeof(int));
    int *ptr1 = ptr0;

    // change either pointer to a NULL pointer
    if (1) {
        ptr0 = NULL;
    } else {
        ptr1 = NULL;
    }

    // this frees the block pointed by ptr which is also the only block
    free(ptr0);
    free(ptr1);
    return 0;
}