#include <stdlib.h>

// Definitely lost memory leak from unfreed struct member num
struct A
{
	int * num;
};

int main()
{
	struct A * obj = malloc(sizeof(struct A));
	obj->num = malloc(sizeof(int));

	free(obj);
}