#include <stdlib.h>

// unrelated libraries
#include <stdio.h>
#include <stdint.h>

// global variable
int *global_ptr0;
static int *global_ptr1;

// macro
#define MALLOC(size) malloc(size)
#define INT_POINTER_CAST (int *)

// struct
struct S1
{
	char a;
	struct S1 *b;
	struct S1 *c;
} s1;

struct S2
{
	struct S1 *a;
} s2;

// basic
void func_basic()
{
	int *ptr0 = (int *)malloc(sizeof(int));
	int *ptr1 = ptr0;
	free(ptr0);
	free(ptr0);

	ptr0 = (int *)calloc(2, sizeof(int));
	ptr1 = (int *)realloc(ptr1, sizeof(int));
	ptr1 = (int *)aligned_alloc(4, sizeof(int));

	int **ptr2 = &(*&ptr0);
	**ptr2 = **ptr2 + 1;
	*ptr2 = *ptr2 + 1;
	ptr2 = -20 + ptr2 + 20 * (100 + (30 << 1));
	free(-20 + *ptr2 + 1);
	free(ptr2 - 20 * (100 + (30 << 1)));

	// some different types that are not of importance
	int64_t *ptr3 = (int64_t *)malloc(sizeof(int64_t));
	free(ptr3);
}

void func_scope(int *ptr0)
{
	int *ptr1 = ptr0;

	// scope
	{
		int *ptr1 = ptr0;
		{
			int *ptr1 = ptr0;
			ptr0 = ptr1;
		}
		ptr0 = ptr1;
	}

	ptr1 = ptr0;
}

void func_struct_global_and_malloc()
{
	s1.a = 'a';
	*s2.a = s1;
	**(&s2.a) = s1;
	s1.b->b = (struct S1 *)malloc(sizeof(struct S1));
	s1.b->b->b = (struct S1 *)malloc(sizeof(s1));

	global_ptr0 = INT_POINTER_CAST MALLOC(sizeof(int));
	global_ptr1 = global_ptr0;
	free(global_ptr1);
}

void func_array(int size)
{
	int array0[size];
	int *array1 = (int *)calloc(size, sizeof(int));
	int *array2[2] = {array1};
}

// declaration of functions to be called later
void func_if(int condition);
void func_switch(int condition);
void func_for(long condition);
void func_while();
void func_do_while();
int func_func(int **double_pointer, int end_cond);

int main()
{
	int *ptr0 = (int *)malloc(sizeof(int));
	func_scope(ptr0);
	free(ptr0);

	func_struct_global_and_malloc();
	func_array(4);
	func_if(0);
	func_switch(0);
	func_for((long)ptr0 + 1 - 1);
	func_while();
	func_do_while();
	func_func(&ptr0, 2);

	return 0;
}

void func_if(int condition)
{
	int *ptr0 = (int *)malloc(sizeof(int));
	int *ptr1;

	ptr1 = ptr0;
	if (condition)
	{
		ptr1 = ptr0 + 1;
		if (condition * 2)
		{
			ptr1 = ptr0 + 2;
		}
		else
		{
			ptr1 = ptr0 + 3;
		}
		ptr1 = ptr0 + 4;
	}
	else if (condition + 1)
	{
		ptr1 = ptr0 + 5;
		if (condition * 3)
		{
			ptr1 = ptr0 + 6;
		}
		ptr1 = ptr0 + 7;
	}
	else if (condition + 2)
	{
		ptr1 = ptr0 + 8;
	}
	ptr1 = ptr0 + 9;

	free(ptr0);
}

void func_switch(int condition)
{
	int *ptr0 = (int *)malloc(sizeof(int));
	int *ptr1 = ptr0;

	switch (condition)
	{
	case 0:
		ptr1 = ptr0;
		break;
	case 1:
	case 2:
		ptr1 = ptr0 + 1;
	case 3:
		ptr1 = ptr0 + 2;
		break;
	case 4:
		ptr1 = ptr0 + 3;
		break;
	case 5:
		ptr1 = ptr0 + 4;
	default:
		ptr1 = ptr0 + 5;
	case 6:
		break;
	}

	free(ptr0);
}

void func_for(long end)
{
	int *ptr;
	for (long i = 0 + 1; i < end; i++)
	{
		ptr = (int *)malloc(sizeof(int));
		free(ptr);
	}
}

void func_while()
{
	int *ptr;
	while (ptr)
	{
		ptr = (int *)malloc(sizeof(int));
		free(ptr);
	}
}

void func_do_while()
{
	int *ptr;
	do
	{
		ptr = (int *)malloc(sizeof(int));
		free(ptr);
	} while (ptr);
}

void func_recur(int **indirect_ptr, int end_condition)
{
	if (end_condition)
	{
		indirect_ptr += 8;
		func_func(indirect_ptr, end_condition - 1);
	}
}

int func_func(int **indirect_ptr, int end_condition)
{
	func_recur(indirect_ptr, end_condition);
	return **indirect_ptr;
}
