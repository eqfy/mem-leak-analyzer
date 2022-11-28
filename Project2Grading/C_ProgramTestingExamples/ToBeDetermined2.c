#include <stdlib.h>

// Ideally, should be able to analyze it with a leak
// But most likely too difficult and will be treated as an if
struct S {
    char a;
    struct S *b;
};

int main() {
    struct S *ptr = malloc(sizeof(struct S));
    struct S *curr = ptr;
    int i = 0;
    while (i++ < 5) {
        curr->b = malloc(sizeof(struct S));
        curr = curr->b;
    }
    /* Above might be converted into:
        if (...) {
            curr->b = malloc(sizeof(struct S));
            curr = curr->b;
        }
        Which will actually cause it to be leak-free
    */

    free(ptr->b);
    free(ptr);

    return 0;
}