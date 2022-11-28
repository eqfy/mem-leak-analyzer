#include <stdlib.h>

int main() {
    int *ptr0 = malloc(sizeof(int));
    int *ptr1 = malloc(sizeof(int));

    // memory block pointed by ptr0 now has no pointer pointing to it - 100% leak
    ptr0 = ptr1;

    free(ptr0);
    free(ptr1);

    return 0;
}
