#include <stdlib.h>

// Ideally, should be able to analyze it with no found errors
int main() {
    int *ptr;

    // allocate a block in either branch
    if (1) {
        ptr = malloc(sizeof(int));
    } else {
        ptr = malloc(sizeof(int) * 2);
    }

    // this frees the block pointed by ptr which is also the only block
    free(ptr);
    return 0;
}