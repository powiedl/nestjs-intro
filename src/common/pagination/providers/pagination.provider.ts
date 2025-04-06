import { Injectable, Inject } from '@nestjs/common';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { ObjectLiteral, Repository } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Paginated } from '../interfaces/paginated.interface';

@Injectable()
export class PaginationProvider {
  constructor(
    /**
     * Injecting request
     */
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}
  public async paginateQuery<T extends ObjectLiteral>(
    paginationQuery: PaginationQueryDto,
    repository: Repository<T>,
  ): Promise<Paginated<T>> {
    let results = await repository.find({
      skip: (paginationQuery.page - 1) * paginationQuery.limit,
      take: paginationQuery.limit,
    });

    /**
     * create the request URLs
     */
    const baseUrl =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseUrl);
    //console.log('baseUrl', baseUrl);
    //console.log('newUrl', newUrl);

    /**
     * calculating the page numbers
     */
    const totalItems = await repository.count();
    const totalPages = Math.ceil(totalItems / paginationQuery.limit);
    const nextPage =
      paginationQuery.page === totalPages
        ? paginationQuery.page
        : paginationQuery.page + 1;
    const previousPage =
      paginationQuery.page === 1 ? 1 : paginationQuery.page - 1;

    // calculate the links and preserve originally query parameters
    const firstPageUrl = new URL(newUrl);
    const prevPageUrl = new URL(newUrl);
    const nextPageUrl = new URL(newUrl);
    const lastPageUrl = new URL(newUrl);
    firstPageUrl.searchParams.set('page', '1');
    prevPageUrl.searchParams.set('page', previousPage.toString());
    nextPageUrl.searchParams.set('page', nextPage.toString());
    lastPageUrl.searchParams.set('page', totalPages.toString());

    const finalResponse: Paginated<T> = {
      data: results,
      meta: {
        itemsPerPage: paginationQuery.limit,
        totalItems,
        currentPage: paginationQuery.page,
        totalPages,
      },
      links: {
        first: firstPageUrl.toString(),
        previous: prevPageUrl.toString(),
        current: newUrl.toString(),
        next: nextPageUrl.toString(),
        last: lastPageUrl.toString(),
      },
    };
    return finalResponse;
  }
}
