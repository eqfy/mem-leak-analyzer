#include <stdlib.h>
int main()
{
	//alocate some memory
	int *ptr1 = malloc(sizeof(int));
	//free memory for no memory leak at all
	free(ptr1);
    return 0;
}
