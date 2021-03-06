<?php

namespace spec\Pim\Bundle\FilterBundle\Filter;

use Oro\Bundle\FilterBundle\Filter\ChoiceFilter;
use PhpSpec\ObjectBehavior;
use Pim\Bundle\FilterBundle\Datasource\FilterDatasourceAdapterInterface;
use Pim\Bundle\FilterBundle\Filter\ProductFilterUtility;
use Oro\Bundle\FilterBundle\Form\Type\Filter\BooleanFilterType;
use Akeneo\Pim\Enrichment\Component\Product\Query\Filter\Operators;
use Symfony\Component\Form\FormFactoryInterface;

class CompletenessFilterSpec extends ObjectBehavior
{
    function let(FormFactoryInterface $factory, ProductFilterUtility $utility)
    {
        $this->beConstructedWith($factory, $utility);
    }

    function it_is_an_oro_choice_filter()
    {
        $this->shouldBeAnInstanceOf(ChoiceFilter::class);
    }

    function it_applies_a_filter_on_complete_products(
        FilterDatasourceAdapterInterface $datasource,
        $utility
    ) {
        $utility->applyFilter($datasource, 'completeness', Operators::EQUALS_ON_AT_LEAST_ONE_LOCALE, 100)
            ->shouldBeCalled();

        $this->apply($datasource, ['type' => null, 'value' => BooleanFilterType::TYPE_YES]);
    }

    function it_applies_a_filter_on_not_complete_products(
        FilterDatasourceAdapterInterface $datasource,
        $utility
    ) {
        $utility->applyFilter($datasource, 'completeness', Operators::LOWER_THAN_ON_AT_LEAST_ONE_LOCALE, 100)
            ->shouldBeCalled();

        $this->apply($datasource, ['type' => null, 'value' => BooleanFilterType::TYPE_NO]);
    }
}
