<?php

namespace spec\Pim\Bundle\DataGridBundle\Extension\Sorter\Product;

use Pim\Bundle\DataGridBundle\Extension\Sorter\SorterInterface;
use Oro\Bundle\DataGridBundle\Datagrid\RequestParameters;
use PhpSpec\ObjectBehavior;
use Pim\Bundle\DataGridBundle\Datasource\ProductDatasource;
use Akeneo\Pim\Enrichment\Component\Product\Query\ProductQueryBuilderInterface;

class InGroupSorterSpec extends ObjectBehavior
{
    function let(RequestParameters $params)
    {
        $this->beConstructedWith($params);
    }

    function it_is_a_sorter()
    {
        $this->shouldImplement(SorterInterface::class);
    }

    function it_applies_a_sort_on_in_group_products(
        ProductDatasource $datasource,
        ProductQueryBuilderInterface $pqb,
        $params
    ) {
        $datasource->getProductQueryBuilder()->willReturn($pqb);
        $params->get('currentGroup', null)->willReturn(12);
        $pqb->addSorter('in_group_12', 'ASC')->shouldBeCalled();

        $this->apply($datasource, 'in_group', 'ASC');
    }
}
