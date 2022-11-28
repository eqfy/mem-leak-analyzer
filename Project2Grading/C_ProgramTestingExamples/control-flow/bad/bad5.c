#include <stdlib.h>

// Ideally, should be able to analyze it with a leak
// But most likely too difficult and will be treated as loop body + an if
struct S {
    char a;
    struct S *b;
};

int main() {
    struct S *ptr = malloc(sizeof(struct S));
    struct S *curr = ptr;
    int i = 0;
    do {
        curr->b = malloc(sizeof(struct S));
        curr = curr->b;
    } while (i++ < 5);
    /* Above might be converted into:
        curr->b = malloc(sizeof(struct S));
        curr = curr->b;
        if (...) {
            curr->b = malloc(sizeof(struct S));
            curr = curr->b;
        }
        Which will actually cause it to be leak-free
    */

    free(ptr->b->b);
    free(ptr->b);
    free(ptr);

    return 0;
}