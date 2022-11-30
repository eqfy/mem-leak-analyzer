  #include <stdlib.h>

  void f()
  {
     int* x = malloc(10 * sizeof(int)); //memory not freed and is lost 
     x[10] = 0;        					//accessing memory outside the list
  }           

  int main()
  {
     f();
     return 0;
  }