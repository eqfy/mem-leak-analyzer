#include <stdlib.h>

// Recursion that allocates and frees nested structs
// Ideally, should be able to analyze it with no found errors
// Though this might be to complicated for static analysis
// Personal note: it might be a good idea to enforce that a function always free any memory it allocates if recursion is supported like good1.c
struct S {
    char a;
    struct s *b;
};

struct S *allocate(int count) {
    struct S *ptr = malloc(sizeof(struct S));
    if (count != 0) {
        ptr->b = allocate(count - 1);
    }
    return ptr;
}

void deallocate(struct S* ptr) {
    if (ptr == NULL)
        return;
    deallocate(ptr->b);
    free(ptr);
}

int main() {
    // recursively create a nested struct of level 5 then free it
    // even if this is -5, infinite recursion should not be of concern
    deallocate(allocate(5));

    return 0;
}