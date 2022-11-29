#include <stdlib.h>

//Leaks from no frees at all
int main() 
{
	int * num = malloc(sizeof(int));

	int val = func1(num);

	num = 0;
}

int func1(int * a)
{
	return *a + 3;
}