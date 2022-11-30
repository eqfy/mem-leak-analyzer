#include <stdio.h>

//
static void fileopen(void)
{
	//replace fp to some file location on your computer
    FILE *fp = fopen("", "r");
    char buffer[2048];
    while (fgets(buffer, sizeof(buffer), fp) != 0)
        fputs(buffer, stdout);
	//by not closing it we end up having a mem leak at fp
    /* fclose(fp); */
}

//main function to run code
int main(void)
{
    fileopen();
    return 0;
}