#include <stdlib.h>

// Indirect allocations should be freed in correct order
// Should be able to analyze it with a found leak on line 17
struct S {
    char a;
    int *b;
};

int main() {
    // allocate the struct and an int that its member b points to
    struct S *ptr0 = malloc(sizeof(struct S));
    ptr0->b = malloc(sizeof(int));

    // free the struct means the allocated int is no longer accessible - 100% leak
    // even if calling free on ptr0->b later, it is still considered a leak
    free(ptr0);

    return 0;
}