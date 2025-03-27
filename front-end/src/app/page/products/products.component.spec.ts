import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsComponent } from './products.component';
import { ProductServiceService } from 'src/app/services/product-service.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { Product } from 'src/app/interfaces/Product';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let productService: jasmine.SpyObj<ProductServiceService>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductServiceService', ['getProducts', 'createProduct', 'updateProduct', 'deleteProduct']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [ProductsComponent],
      providers: [
        { provide: ProductServiceService, useValue: productServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductServiceService) as jasmine.SpyObj<ProductServiceService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize products on ngOnInit', () => {
    const mockProducts: Product[] = [{ id: '1', title: 'Product 1', userId: '1' }];
    productService.getProducts.and.returnValue(of(mockProducts));

    component.ngOnInit();

    expect(productService.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
  });

  it('should handle error when getting products', () => {
    productService.getProducts.and.returnValue(throwError(() => new Error('Error fetching products')));

    component.ngOnInit();

    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('should create a product and add it to the list', () => {
    const newProduct: Product = { id: '2', title: 'New Product', userId: '1' };
    productService.createProduct.and.returnValue(of(newProduct));

    component.createProduct({ id: '2', title: 'New Product', userId: '1' });

    expect(productService.createProduct).toHaveBeenCalled();
    expect(component.products[0]).toEqual(newProduct);
  });

  it('should handle error when creating a product', () => {
    productService.createProduct.and.returnValue(throwError(() => new Error('Error creating product')));

    component.createProduct({ id: '2', title: 'New Product', userId: '1' });

    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('should update a product', () => {
    component.products = [{ id: '1', title: 'Old Product', userId: '1' }];
    const updatedProduct: Product = { id: '1', title: 'Updated Product', userId: '1' };
    productService.updateProduct.and.returnValue(of(updatedProduct));

    component.updateProduct(updatedProduct);

    expect(productService.updateProduct).toHaveBeenCalledWith(updatedProduct);
    expect(component.products[0].title).toBe('Updated Product');
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });

  it('should handle error when updating a product', () => {
    productService.updateProduct.and.returnValue(throwError(() => new Error('Error updating product')));

    component.updateProduct({ id: '1', title: 'Updated Product', userId: '1' });

    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('should delete a product', () => {
    component.products = [{ id: '1', title: 'Product 1', userId: '1' }];
    productService.deleteProduct.and.returnValue(of({ id: '1', title: 'Product 1', userId: '1' }));

    component.deleteProduct({ id: '1', title: 'Product 1', userId: '1' });

    expect(productService.deleteProduct).toHaveBeenCalledWith(jasmine.objectContaining({ id: '1' }));
    expect(component.products.length).toBe(0);
  });

  it('should handle error when deleting a product', () => {
    productService.deleteProduct.and.returnValue(throwError(() => new Error('Error deleting product')));

    component.deleteProduct({ id: '1', title: 'Product 1', userId: '1' });

    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('should track products by id', () => {
    const product: Product = { id: '1', title: 'Product 1', userId: '1' };
    expect(component.trackByProductId(product)).toBe('1');
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const completeSpy = spyOn(component["destroy$"], 'complete');
    component.ngOnDestroy();
    expect(completeSpy).toHaveBeenCalled();
  });
});
