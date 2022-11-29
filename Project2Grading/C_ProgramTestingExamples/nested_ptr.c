#include <stdlib.h>

// Leak of malloc'd memory from nested pointer
int main()
{
	int * num = malloc(sizeof(int));

	int ** num_pointer = &num;

	free(num_pointer);
}