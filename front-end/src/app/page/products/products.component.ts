import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Product } from 'src/app/interfaces/Product';
import { ProductServiceService } from 'src/app/services/product-service.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {
  
  products: Product[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly productService: ProductServiceService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initProducts();
  }

  private initProducts(): void {
    this.productService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Product[]) => this.products = data,
        error: () => this.showErrorMessage()
      });
  }

  createProduct(product: Product): void {
    const newItem: Product = { ...product, userId: "1" };

    this.productService.createProduct(newItem)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: Product) => this.products = [res, ...this.products],
        error: () => this.showErrorMessage()
      });
  }

  updateProduct(product: Product): void {
    this.productService.updateProduct(product)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedProduct: Product) => {
          const index = this.products.findIndex(p => p.id === updatedProduct.id);
          if (index !== -1) this.products[index] = updatedProduct;
          this.products = [...this.products];
          this.showSuccessMessage('Product Updated', 'The product was successfully updated.');
        },
        error: () => this.showErrorMessage()
      });
  }

  deleteProduct(product: Product): void {
    this.productService.deleteProduct(product)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.products = this.products.filter(p => p.id !== product.id),
        error: () => this.showErrorMessage()
      });
  }

  private showErrorMessage(): void {
    this.messageService.add({ severity: 'error', summary: 'Something went wrong', detail: 'Please try again later.', life: 3000 });
  }

  private showSuccessMessage(summary: string, detail: string): void {
    this.messageService.add({ severity: 'success', summary, detail, life: 3000 });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByProductId(product: Product): string | undefined {
    return product.id;
  }
}
