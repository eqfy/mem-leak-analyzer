#include <stdlib.h>

// All allocated memory blocks should always have at least 1 pointer pointing to it
// A found leak on line 7

int main() {
    // malloc without assigning return value - 100% leak
    malloc(sizeof(int));
    int *ptr = malloc(sizeof(int));
    free(ptr);

    return 0;
}
